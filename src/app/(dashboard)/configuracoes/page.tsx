import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Settings, Users, Bell, Link2, Shield } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Configurações do sistema e integrações"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notificações e Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Aluno sem reunião há mais de 21 dias', desc: 'Gerar alerta automático quando um aluno ficar mais de 21 dias sem reunião' },
              { label: 'Aluno sem próxima reunião marcada', desc: 'Alertar quando não houver reunião futura agendada' },
              { label: 'Prontuário não preenchido após reunião', desc: 'Alertar mentor quando reunião realizada ficar sem prontuário por mais de 48h' },
              { label: 'Checklist semanal não preenchido', desc: 'Alertar quando a semana terminar sem checklist' },
              { label: 'Aluno com múltiplos pontos de atenção', desc: 'Escalar aluno para crítico quando acumular pontos de atenção' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Integração Calendly
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-medium text-blue-800">Calendly — Fase 3 da Implementação</p>
              <p className="text-sm text-blue-700 mt-1">
                A integração com Calendly permitirá importar reuniões automaticamente, identificar alunos sem reunião marcada e sincronizar a agenda com o sistema.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Webhook URL do Calendly</Label>
                <Input placeholder="https://calendly.com/webhooks/..." className="mt-1.5" disabled />
              </div>
              <div>
                <Label>API Key</Label>
                <Input placeholder="eyJhbGci..." type="password" className="mt-1.5" disabled />
              </div>
            </div>
            <Button variant="outline" disabled>Conectar Calendly (Em breve)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Segurança e LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Row Level Security (RLS)', status: 'Ativo', ok: true },
                { label: 'Autenticação por perfil', status: 'Configurado', ok: true },
                { label: 'Logs de alteração', status: 'Ativo', ok: true },
                { label: 'Consentimento de gravação', status: 'Pendente', ok: false },
                { label: 'Proteção de dados sensíveis', status: 'Ativo', ok: true },
                { label: 'Backup automático', status: 'Supabase', ok: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border p-3">
                  <p className="font-medium">{item.label}</p>
                  <span className={`text-xs font-semibold ${item.ok ? 'text-emerald-600' : 'text-yellow-600'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inteligência Artificial (Fase 3)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <p className="text-sm font-medium text-purple-800">IA para Mentoria — Em desenvolvimento</p>
              <p className="text-sm text-purple-700 mt-1">
                Transcrição automática de reuniões, geração de prontuários, briefings pré-reunião e guias de estudo via IA.
              </p>
            </div>
            {[
              { label: 'API de Transcrição', desc: 'Whisper / AssemblyAI', status: 'Não configurado' },
              { label: 'API de IA (Prontuário)', desc: 'Claude / GPT-4', status: 'Não configurado' },
              { label: 'API de IA (Briefing)', desc: 'Claude / GPT-4', status: 'Não configurado' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
