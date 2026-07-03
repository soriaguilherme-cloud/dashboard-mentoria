'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquare,
  Send,
  Workflow,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { getStudentsForUser } from '@/lib/access-control'
import {
  getCommunicationHistory,
  getDocumentsByStatus,
  getInternalStudentSummary,
  getKanbanStages,
  getOperationQualityMetrics,
  getStudentDocuments,
} from '@/lib/internal-operations'
import { cn } from '@/lib/utils'

const toneClasses = {
  red: 'border-red-200 bg-red-50 text-red-800',
  yellow: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-800',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  slate: 'border-slate-200 bg-slate-50 text-slate-800',
}

const stageHeaderClasses = {
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
}

const statusLabel = {
  rascunho: 'Rascunho',
  revisado: 'Revisado',
  enviado: 'Enviado',
}

const statusTone = {
  rascunho: 'bg-yellow-100 text-yellow-800',
  revisado: 'bg-blue-100 text-blue-700',
  enviado: 'bg-emerald-100 text-emerald-700',
}

export default function OperacaoPage() {
  const { user } = useAuth()
  const students = getStudentsForUser(user)
  const stages = getKanbanStages(students)
  const qualityMetrics = getOperationQualityMetrics(students)
  const documentStatus = getDocumentsByStatus(students)
  const pendingDocuments = students
    .flatMap(student =>
      getStudentDocuments(student.id)
        .filter(document => document.status !== 'enviado')
        .map(document => ({ document, student }))
    )
    .slice(0, 6)
  const communicationLogs = students
    .flatMap(student =>
      getCommunicationHistory(student.id).map(log => ({ log, student }))
    )
    .sort((a, b) => new Date(b.log.createdAt).getTime() - new Date(a.log.createdAt).getTime())
    .slice(0, 6)
  const criticalStudents = students
    .filter(student => student.status === 'critico' || student.risk_score >= 7 || !student.next_meeting_at)
    .sort((a, b) => b.risk_score - a.risk_score)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operação Interna"
        description="Esteira do time para acompanhar alunos, documentos, comunicações e gargalos da mentoria"
        action={
          <Link href="/reunioes/nova">
            <Button className="gap-2">
              <Workflow className="h-4 w-4" />
              Criar ação
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {qualityMetrics.map(metric => (
          <Card key={metric.label} className={cn('border-l-4 bg-white', toneClasses[metric.tone])}>
            <CardContent className="p-4">
              <p className="text-xs font-medium opacity-80">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold">
                {metric.value}{metric.suffix ?? ''}
              </p>
              <p className="mt-1 text-xs opacity-75">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_.8fr]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Workflow className="h-4 w-4 text-primary" />
                  Kanban operacional
                </CardTitle>
                <CardDescription>Fila interna do aluno, da reunião até o envio do documento.</CardDescription>
              </div>
              <Badge variant="secondary">{students.length} alunos no escopo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 lg:grid-cols-5">
              {stages.map(stage => (
                <div key={stage.id} className="min-h-[280px] rounded-xl border border-border/60 bg-muted/20 p-3">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{stage.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{stage.description}</p>
                    </div>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', stageHeaderClasses[stage.tone])}>
                      {stage.students.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {stage.students.slice(0, 4).map(student => {
                      const summary = getInternalStudentSummary(student)
                      return (
                        <Link
                          key={`${stage.id}-${student.id}`}
                          href={`/alunos/${student.id}`}
                          className="block rounded-xl border border-border/70 bg-white p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-semibold">{student.name}</p>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
                              R{student.risk_score}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{summary.recommendedAction}</p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${summary.completion}%` }} />
                          </div>
                        </Link>
                      )
                    })}
                    {stage.students.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border bg-white/60 p-4 text-center text-xs text-muted-foreground">
                        Nenhum aluno nesta etapa.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Prioridades do time
            </CardTitle>
            <CardDescription>Alunos que precisam de decisão ou ação rápida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalStudents.slice(0, 5).map(student => {
              const summary = getInternalStudentSummary(student)
              return (
                <Link
                  key={student.id}
                  href={`/alunos/${student.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{student.name}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{summary.riskReason}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </Link>
              )
            })}
            {criticalStudents.length === 0 && (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                Nenhum aluno crítico no seu escopo.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Documentos internos
            </CardTitle>
            <CardDescription>Controle de rascunhos, revisão e envio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(documentStatus).map(([status, value]) => (
                <div key={status} className="rounded-xl bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{statusLabel[status as keyof typeof statusLabel]}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {pendingDocuments.map(({ document, student }) => (
                <Link
                  key={document.id}
                  href={document.meetingId ? `/reunioes/${document.meetingId}/relatorio-aluno` : `/alunos/${student.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{document.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{student.name}</p>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusTone[document.status])}>
                    {statusLabel[document.status]}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-primary" />
              Histórico de comunicação
            </CardTitle>
            <CardDescription>Registros do que foi enviado ou combinado fora do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {communicationLogs.map(({ log, student }) => (
              <div key={log.id} className="rounded-xl border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{log.title}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {log.channel}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{log.summary}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">{student.name} · {log.owner}</p>
              </div>
            ))}
            {communicationLogs.length === 0 && (
              <div className="rounded-xl bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                Nenhuma comunicação registrada.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              Qualidade da operação
            </CardTitle>
            <CardDescription>Checklist macro do processo interno.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Central do aluno revisada antes da reunião', done: true },
              { label: 'Documento gerado a partir do prontuário', done: pendingDocuments.length < students.length },
              { label: 'Comunicação registrada após envio', done: communicationLogs.length > 0 },
              { label: 'Aluno crítico escalado para supervisão', done: criticalStudents.length > 0 },
              { label: 'Indicadores executivos atualizados', done: qualityMetrics.length > 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Send className="h-4 w-4 text-yellow-600" />
                )}
                <p className="text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
