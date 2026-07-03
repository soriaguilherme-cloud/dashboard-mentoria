# Deploy na VPS

Este projeto está preparado para rodar em produção como container Docker usando o build standalone do Next.js.

## 1. Instalar dependências na VPS

Na VPS, instale Docker e Docker Compose Plugin.

Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 2. Clonar o projeto

```bash
git clone <URL_DO_NOVO_REPOSITORIO_GITHUB> dashboard-mentoria
cd dashboard-mentoria
```

## 3. Configurar variáveis

```bash
cp .env.example .env
nano .env
```

Preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 4. Subir a aplicação

```bash
docker compose up -d --build
```

A aplicação ficará disponível na porta `3000`:

```bash
http://IP_DA_VPS:3000
```

## 5. Atualizar produção

Quando houver novo commit no GitHub:

```bash
git pull
docker compose up -d --build
```

## 6. Comandos úteis

```bash
docker compose ps
docker compose logs -f dashboard-mentoria
docker compose restart dashboard-mentoria
docker compose down
```
