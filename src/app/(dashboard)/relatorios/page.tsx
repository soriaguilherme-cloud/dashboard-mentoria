import { mockMonthlyReports, mockStudents, mockProfiles } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Clock, Target, BookOpen, Plus, Download } from 'lucide-react'

const MONTHS = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function RelatoriosPage() {
  const reports = mockMonthlyReports.map(r => ({
    ...r,
    student: mockStudents.find(s => s.id === r.student_id),
    createdBy: mockProfiles.find(p => p.id === r.created_by),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios Mensais"
        description="Acompanhamento de desempenho e evolução dos alunos"
        action={
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl">
            <Plus className="h-4 w-4" /> Novo Relatório
          </Button>
        }
      />

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
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground flex-shrink-0">
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
