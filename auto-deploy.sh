#!/usr/bin/env bash
# Auto-commit + push + Coolify redeploy on src/ changes
# Usage: npm run deploy:watch  (or  bash auto-deploy.sh)
# Stop : Ctrl+C

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

# Segredos ficam em .env / .env.local (gitignored). NUNCA commite o token aqui.
for envf in "$REPO_DIR/.env" "$REPO_DIR/.env.local"; do
  [ -f "$envf" ] && { set -a; . "$envf"; set +a; }
done
COOLIFY_URL="${COOLIFY_URL:-http://31.97.91.37:8000}"
APP_UUID="${APP_UUID:-sa97dd2l74w47u6dnw4eqa0f}"

if [ -z "${COOLIFY_TOKEN:-}" ]; then
  echo "[auto-deploy] ERRO: COOLIFY_TOKEN não definido."
  echo "  Adicione em .env.local:  COOLIFY_TOKEN=\"seu_token_novo\""
  exit 1
fi
DEBOUNCE=4          # seconds to wait after last change
FLAG_FILE="/tmp/autodeploy_${APP_UUID}.flag"

# ---- helpers ---------------------------------------------------------------

coolify_deploy() {
  RESULT=$(curl -s -X POST \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    "$COOLIFY_URL/api/v1/deploy?uuid=$APP_UUID&force=false")
  MSG=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['deployments'][0]['message'])" 2>/dev/null)
  echo "[coolify] ${MSG:-deploy triggered}"
}

commit_and_push() {
  cd "$REPO_DIR" || return

  # nothing staged or unstaged?
  if git diff --quiet && git diff --cached --quiet \
     && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "[auto-deploy] sem mudanças para commitar"
    return
  fi

  MSG="auto: $(date '+%d/%m %H:%M:%S')"
  git add -A
  git commit -m "$MSG" --quiet && echo "[auto-deploy] commit: $MSG"
  git push origin main --quiet && echo "[auto-deploy] push → GitHub ✓"
  coolify_deploy
}

cleanup() {
  rm -f "$FLAG_FILE"
  kill "$DEBOUNCE_PID" 2>/dev/null
  echo ""
  echo "[auto-deploy] parado."
  exit 0
}
trap cleanup INT TERM

# ---- debounce loop (reads flag file timestamp) -----------------------------
(
  while true; do
    if [ -f "$FLAG_FILE" ]; then
      STAMP=$(cat "$FLAG_FILE" 2>/dev/null)
      NOW=$(date +%s)
      ELAPSED=$(( NOW - STAMP ))
      if [ "$ELAPSED" -ge "$DEBOUNCE" ]; then
        rm -f "$FLAG_FILE"
        commit_and_push
      fi
    fi
    sleep 1
  done
) &
DEBOUNCE_PID=$!

# ---- banner ----------------------------------------------------------------
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Auto-Deploy  ·  dashboard-mentoria      │"
echo "  │  Assistindo src/ · debounce ${DEBOUNCE}s           │"
echo "  │  Coolify: $APP_UUID  │"
echo "  │  Ctrl+C para parar                       │"
echo "  └─────────────────────────────────────────┘"
echo ""

# ---- file watcher ----------------------------------------------------------
fswatch -r -l 0.5 \
  --exclude "\.next" \
  --exclude "node_modules" \
  --exclude "\.git" \
  "$REPO_DIR/src" \
  "$REPO_DIR/public" \
| while read -r changed; do
    FNAME=$(basename "$changed")
    echo "[auto-deploy] mudança: $FNAME"
    date +%s > "$FLAG_FILE"   # update timestamp → resets debounce
  done
