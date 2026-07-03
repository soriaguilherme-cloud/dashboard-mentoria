'use client'

import type React from 'react'
import { mockMonthlyReports, mockStudents, mockProfiles, mockAlerts } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Clock, Target, BookOpen, Plus, Download, CalendarCheck, ClipboardList, CheckSquare, Sparkles } from 'lucide-react'
import {
  getChecklistCompletionByWeek,
  getFutureMeetingRate,
  getPendingRecordsByMentor,
  getPrepCourseComparison,
  getWeeklySummaryForRole,
} from '@/lib/operational-intelligence'
import { useAuth } from '@/lib/auth-context'
import { getAlertsForUser, getStudentsForUser } from '@/lib/access-control'
import { exportPdfDocument } from '@/lib/pdf-export'

const MONTHS = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function RelatoriosPage() {
  const { user } = useAuth()
  const scopedStudents = user ? getStudentsForUser(user) : mockStudents
  const scopedAlerts = user ? getAlertsForUser(user) : mockAlerts
  const reports = mockMonthlyReports.map(r => ({
    ...r,
    student: mockStudents.find(s => s.id === r.student_id),
    createdBy: mockProfiles.find(p => p.id === r.created_by),
  }))
  const futureMeetingRate = getFutureMeetingRate(scopedStudents)
  const pendingByMentor = getPendingRecordsByMentor(scopedStudents)
  const checklistByWeek = getChecklistCompletionByWeek(scopedStudents)
  const prepCourseComparison = getPrepCourseComparison(scopedStudents)
  const weeklySummary = getWeeklySummaryForRole(user?.role ?? 'coordenacao', scopedStudents, scopedAlerts)

  function exportConsolidatedPdf() {
    exportPdfDocument({
      title: 'Relatorio Mensal Consolidado',
      subtitle: weeklySummary,
      filename: 'Relatorio Mensal Consolidado.pdf',
      metadata: [
        ['Perfil', user?.name ?? 'Coordenacao'],
        ['Alunos no escopo', String(scopedStudents.length)],
        ['Alunos com reuniao futura', `${futureMeetingRate}%`],
        ['Prontuarios pendentes', String(pendingByMentor.reduce((sum, item) => sum + item.pending, 0))],
        ['Checklists concluidos', `${checklistByWeek[0]?.completed ?? 0}/${checklistByWeek[0]?.total ?? 0}`],
      ],
      sections: [
        {
          title: 'Indicadores gerais',
          rows: [
            ['Relatorios', String(reports.length)],
            ['Media de horas', `${Math.round(reports.reduce((sum, report) => sum + (report.study_hours ?? 0), 0) / (reports.length || 1))}h`],
            ['Acuracia media', `${Math.round(reports.reduce((sum, report) => sum + (report.accuracy_percentage ?? 0), 0) / (reports.length || 1))}%`],
            ['Simulados totais', String(reports.reduce((sum, report) => sum + (report.simulations_count ?? 0), 0))],
          ],
        },
        {
          title: 'Prontuarios pendentes por mentor',
          rows: pendingByMentor.length
            ? pendingByMentor.map(item => [item.mentor.name, `${item.pending} pendente${item.pending > 1 ? 's' : ''}`])
            : [['Status', 'Sem pendencias de prontuario']],
        },
        {
          title: 'Checklists concluidos por semana',
          rows: checklistByWeek.length
            ? checklistByWeek.map(item => [new Date(item.week).toLocaleDateString('pt-BR'), `${item.completed}/${item.total} - ${item.rate}%`])
            : [['Status', 'Sem checklists no periodo']],
        },
        {
          title: 'Comparativo por cursinho',
          rows: prepCourseComparison.map(item => [item.course.name, `${item.students} alunos - risco medio ${item.avgRisk} - ${item.critical} criticos`]),
        },
        {
          title: 'Relatorios de alunos',
          rows: reports.map(report => [
            report.student?.name ?? 'Aluno',
            `${MONTHS[report.month]} ${report.year} - ${report.study_hours ?? 0}h - ${report.accuracy_percentage ?? 0}% acertos`,
          ]),
        },
      ],
    })
  }

  function exportMonthlyReportPdf(report: typeof reports[number]) {
    exportPdfDocument({
      title: `Relatorio Mensal - ${report.student?.name ?? 'Aluno'}`,
      subtitle: `${MONTHS[report.month]} ${report.year}`,
      filename: `Relatorio Mensal - ${report.student?.name ?? 'Aluno'} - ${MONTHS[report.month]} ${report.year}.pdf`,
      metadata: [
        ['Aluno', report.student?.name ?? 'Nao informado'],
        ['Criado por', report.createdBy?.name ?? 'Nao informado'],
        ['Horas de estudo', `${report.study_hours ?? 0}h`],
        ['Acuracia', `${report.accuracy_percentage ?? 0}%`],
        ['Simulados', String(report.simulations_count ?? 0)],
        ['Temas', `${report.topics_completed ?? 0}/${(report.topics_completed ?? 0) + (report.topics_pending ?? 0)}`],
      ],
      sections: [
        {
          title: 'Evolucao percebida',
          body: report.perceived_evolution ?? 'Sem evolucao registrada.',
        },
        {
          title: 'Pontos de atencao',
          body: report.attention_points ?? 'Sem pontos de atencao registrados.',
        },
        {
          title: 'Observacoes do mentor',
          body: report.mentor_observations ?? 'Sem observacoes registradas.',
        },
      ],
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios Mensais"
        description="Acompanhamento de desempenho e evolução dos alunos"
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 rounded-xl" onClick={exportConsolidatedPdf}>
              <Download className="h-4 w-4" /> Exportar PDF
            </Button>
            <Button className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl">
              <Plus className="h-4 w-4" /> Novo Relatório
            </Button>
          </div>
        }
      />

      <Card className="border-l-4 border-l-primary bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-primary">Resumo semanal por perfil</p>
              <p className="mt-1 text-sm text-muted-foreground">{weeklySummary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Relatórios</p>
            <p className="text-2xl font-bold mt-1">{reports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Média de horas</p>
            <p className="text-2xl font-bold mt-1 text-primary">
              {Math.round(reports.reduce((s, r) => s + (r.study_hours ?? 0), 0) / (reports.length || 1))}h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Acurácia média</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              {Math.round(reports.reduce((s, r) => s + (r.accuracy_percentage ?? 0), 0) / (reports.length || 1))}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Simulados totais</p>
            <p className="text-2xl font-bold mt-1">
              {reports.reduce((s, r) => s + (r.simulations_count ?? 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Alunos com reunião futura
            </div>
            <p className="mt-2 text-2xl font-bold">{futureMeetingRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ClipboardList className="h-4 w-4 text-yellow-600" />
              Prontuários pendentes
            </div>
            <p className="mt-2 text-2xl font-bold">{pendingByMentor.reduce((sum, item) => sum + item.pending, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
              Checklists concluídos
            </div>
            <p className="mt-2 text-2xl font-bold">
              {checklistByWeek[0]?.completed ?? 0}/{checklistByWeek[0]?.total ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Cursinhos comparados
            </div>
            <p className="mt-2 text-2xl font-bold">{prepCourseComparison.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricPanel title="Prontuários pendentes por mentor">
          {pendingByMentor.length > 0 ? pendingByMentor.map(item => (
            <MetricLine key={item.mentor.id} label={item.mentor.name} value={`${item.pending} pendente${item.pending > 1 ? 's' : ''}`} />
          )) : <EmptyMetric text="Sem pendências de prontuário." />}
        </MetricPanel>
        <MetricPanel title="Checklists concluídos por semana">
          {checklistByWeek.length > 0 ? checklistByWeek.map(item => (
            <MetricLine key={item.week} label={new Date(item.week).toLocaleDateString('pt-BR')} value={`${item.completed}/${item.total} · ${item.rate}%`} />
          )) : <EmptyMetric text="Sem checklists no período." />}
        </MetricPanel>
        <MetricPanel title="Comparativo por cursinho">
          {prepCourseComparison.map(item => (
            <MetricLine key={item.course.id} label={item.course.name} value={`${item.students} alunos · risco ${item.avgRisk}`} />
          ))}
        </MetricPanel>
      </div>

      {/* Reports */}
      <div className="space-y-4">
        {reports.map(report => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{report.student?.name}</p>
                    <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground font-medium">
                      {MONTHS[report.month]} {report.year}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Por {report.createdBy?.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground flex-shrink-0"
                  onClick={() => exportMonthlyReportPdf(report)}
                >
                  <Download className="h-4 w-4" /> Exportar
                </Button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horas</p>
                    <p className="text-sm font-semibold">{report.study_hours ?? 0}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Acurácia</p>
                    <p className="text-sm font-semibold">{report.accuracy_percentage ?? 0}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Simulados</p>
                    <p className="text-sm font-semibold">{report.simulations_count ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <BookOpen className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Temas</p>
                    <p className="text-sm font-semibold">{report.topics_completed ?? 0}/{(report.topics_completed ?? 0) + (report.topics_pending ?? 0)}</p>
                  </div>
                </div>
              </div>

              {/* Acurácia bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Acurácia</span>
                  <span>{report.accuracy_percentage ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${report.accuracy_percentage ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Observations */}
              <div className="space-y-2 border-t border-border/40 pt-3">
                {report.perceived_evolution && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Evolução percebida</p>
                    <p className="text-sm mt-0.5">{report.perceived_evolution}</p>
                  </div>
                )}
                {report.mentor_observations && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observações do mentor</p>
                    <p className="text-sm mt-0.5 text-muted-foreground">{report.mentor_observations}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium">Nenhum relatório gerado</p>
              <p className="text-sm text-muted-foreground mt-1">Os relatórios mensais consolidam o desempenho de cada aluno.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function MetricPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-3 text-sm font-semibold">{title}</p>
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  )
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
      <p className="truncate text-sm font-medium">{label}</p>
      <p className="flex-shrink-0 text-xs font-semibold text-muted-foreground">{value}</p>
    </div>
  )
}

function EmptyMetric({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">{text}</div>
  )
}
