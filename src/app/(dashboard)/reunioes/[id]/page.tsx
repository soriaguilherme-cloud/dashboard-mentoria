'use client'

import { use, useState } from 'react'
import { notFound, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { mockMeetings, mockMedicalRecords } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, Calendar, Clock, FileText, Edit, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function ReuniaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const meeting = mockMeetings.find(m => m.id === id)
  if (!meeting) notFound()

  const record = mockMedicalRecords.find(r => r.meeting_id === id)

  const tabParam = searchParams.get('tab')
  const defaultTab = tabParam === 'prontuario' || tabParam === 'detalhes' || tabParam === 'transcricao'
    ? tabParam
    : record ? 'prontuario' : 'detalhes'
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/reunioes" className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Reuniões
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{meeting.title}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(meeting.scheduled_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
            {meeting.duration_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {meeting.duration_minutes} minutos
              </span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              meeting.status === 'realizada' ? 'bg-emerald-100 text-emerald-800' :
              meeting.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {meeting.status === 'realizada' ? 'Realizada' : meeting.status === 'agendada' ? 'Agendada' : 'Cancelada'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-muted-foreground">Aluno:</span>
            <Link href={`/alunos/${meeting.student_id}`} className="font-medium hover:text-primary hover:underline">
              {meeting.student?.name}
            </Link>
            <span className="text-muted-foreground">· Mentor: {meeting.mentor?.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {meeting.status === 'realizada' && (
            <Link href={`/reunioes/${meeting.id}/relatorio-aluno`}>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" /> Relatório do Aluno
              </Button>
            </Link>
          )}
          {record && meeting.status === 'realizada' && (
            <Link href={`/reunioes/${meeting.id}/relatorio-aluno`}>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" /> Gerar Guia com IA
              </Button>
            </Link>
          )}
          {!record && meeting.status === 'realizada' && (
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" /> Gerar Prontuário com IA
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="prontuario">
            {record ? 'Prontuário' : 'Registrar Prontuário'}
          </TabsTrigger>
          {meeting.status === 'realizada' && (
            <TabsTrigger value="transcricao">Transcrição / IA</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="detalhes" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Aluno</p>
                  <p className="text-sm">{meeting.student?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Mentor</p>
                  <p className="text-sm">{meeting.mentor?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Data e Hora</p>
                  <p className="text-sm">{format(new Date(meeting.scheduled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Duração</p>
                  <p className="text-sm">{meeting.duration_minutes ? `${meeting.duration_minutes} minutos` : 'Não informado'}</p>
                </div>
              </div>
              {meeting.status === 'agendada' && (
                <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-4 mt-4">
                  <p className="text-sm font-semibold text-blue-800">Reunião ainda não realizada</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Após a reunião, registre o prontuário para manter o histórico do aluno atualizado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prontuario" className="mt-4">
          {record ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Prontuário — {format(new Date(record.record_date), "dd/MM/yyyy", { locale: ptBR })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Gerar encaminhamentos
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-800">Status pós-reunião</p>
                    <p className="mt-1 text-sm text-emerald-900">{record.is_approved ? 'Aprovado e pronto para guia' : 'Aguardando aprovação'}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-800">Template usado</p>
                    <p className="mt-1 text-sm text-blue-900">Acompanhamento regular</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary">Relatório ao aluno</p>
                    <Link href={`/reunioes/${meeting.id}/relatorio-aluno`} className="mt-1 inline-flex text-sm font-semibold text-primary hover:underline">
                      Abrir guia pós-reunião
                    </Link>
                  </div>
                </div>
                <Section title="Resumo da Reunião" content={record.meeting_summary} />
                <Section title="Contexto Atual" content={record.current_context} />
                <div className="grid grid-cols-2 gap-4">
                  <Section title="Dificuldades" content={record.main_difficulties} icon="x" />
                  <Section title="Avanços" content={record.main_advances} icon="check" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Section title="Metas Combinadas" content={record.goals} />
                  <Section title="Próximos Passos" content={record.next_steps} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Section title="O que funcionou" content={record.what_worked} icon="check" />
                  <Section title="O que não funcionou" content={record.what_didnt_work} icon="x" />
                </div>
                {record.attention_points && (
                  <div className="rounded-lg border-l-4 border-l-yellow-500 bg-yellow-50 p-3">
                    <p className="text-xs font-bold text-yellow-800 mb-1">Pontos de Atenção</p>
                    <p className="text-sm text-yellow-900 whitespace-pre-line">{record.attention_points}</p>
                  </div>
                )}
                {record.next_meeting_referrals && (
                  <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-3">
                    <p className="text-xs font-bold text-blue-800 mb-1">Encaminhamentos para Próxima Reunião</p>
                    <p className="text-sm text-blue-900 whitespace-pre-line">{record.next_meeting_referrals}</p>
                  </div>
                )}
                {record.weekly_checklist && (
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs font-bold text-muted-foreground mb-1">Checklist da Semana</p>
                    <p className="text-sm whitespace-pre-line">{record.weekly_checklist}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registrar Prontuário Pós-Reunião</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mb-4">
                  <p className="text-sm text-primary font-medium">Dica: você pode gerar o prontuário automaticamente com IA fazendo upload do áudio ou vídeo da reunião.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {['Acompanhamento regular', 'Aluno crítico', 'Revisão de prova'].map(template => (
                    <button
                      key={template}
                      type="button"
                      className="rounded-xl border border-border/60 p-3 text-left text-sm font-semibold hover:border-primary/40 hover:bg-primary/5"
                    >
                      {template}
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">Template de prontuário</span>
                    </button>
                  ))}
                </div>
                {[
                  { label: 'Resumo da Reunião', placeholder: 'O que foi discutido na reunião?' },
                  { label: 'Contexto Atual do Aluno', placeholder: 'Qual é a situação atual do aluno?' },
                  { label: 'Principais Dificuldades', placeholder: 'Quais são os principais desafios?' },
                  { label: 'Principais Avanços', placeholder: 'O que evoluiu desde a última reunião?' },
                  { label: 'Metas Combinadas', placeholder: 'Quais metas foram definidas?' },
                  { label: 'Próximos Passos', placeholder: 'O que o aluno deve fazer até a próxima reunião?' },
                  { label: 'Pontos de Atenção', placeholder: 'O que precisa ser acompanhado de perto?' },
                  { label: 'O que funcionou', placeholder: 'O que tem dado certo na estratégia do aluno?' },
                  { label: 'O que não funcionou', placeholder: 'O que não está funcionando?' },
                  { label: 'Encaminhamentos para a próxima reunião', placeholder: 'O que deve ser cobrado na próxima reunião?' },
                ].map(field => (
                  <div key={field.label}>
                    <Label className="text-sm font-medium">{field.label}</Label>
                    <Textarea placeholder={field.placeholder} className="mt-1.5 resize-none" rows={3} />
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button className="gap-2"><FileText className="h-4 w-4" /> Salvar Prontuário</Button>
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" /> Gerar com IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transcricao" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transcrição e IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border-2 border-dashed p-8 text-center">
                <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary/30" />
                <p className="text-sm font-medium">Upload de áudio ou vídeo da reunião</p>
                <p className="text-xs text-muted-foreground mt-1">
                  O sistema irá transcrever e gerar automaticamente o prontuário com IA
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Selecionar arquivo
                </Button>
              </div>
              <div className="rounded-lg bg-muted/30 border p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Integração com IA</strong> — O fluxo do relatório do aluno já está preparado para consumir transcrição, prontuário, metas, dúvidas e próximos passos. Quando a API estiver conectada, esta etapa gera uma primeira versão do guia para revisão do mentor.
                </p>
                {record && (
                  <Link href={`/reunioes/${meeting.id}/relatorio-aluno`}>
                    <Button size="sm" className="mt-4 gap-2">
                      <Sparkles className="h-4 w-4" /> Abrir guia gerado
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Section({ title, content, icon }: { title: string; content?: string; icon?: 'check' | 'x' }) {
  if (!content) return null
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
        {icon === 'check' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
        {icon === 'x' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
        {title}
      </p>
      <p className="text-sm whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  )
}
