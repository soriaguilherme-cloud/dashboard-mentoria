import {
  Users, UserCheck, UserX, AlertTriangle, Calendar,
  Stethoscope, BookOpen, Bell, ClipboardList
} from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { PageHeader } from '@/components/shared/page-header'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { StudentsRiskTable } from '@/components/dashboard/students-risk-table'
import { MeetingsChart, StudentStatusPieChart, StudyPhaseChart } from '@/components/dashboard/evolution-chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { mockDashboardStats, mockStudents, mockAlerts, mockProfiles } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const {
    totalStudents, activeStudents, inactiveStudents, criticalStudents,
    totalMentors, totalOrientadores,
    meetingsThisMonth, meetingsPending,
    studentsWithoutFutureMeeting, studentsWithDelayedMeeting,
    unreadAlerts
  } = mockDashboardStats

  const mentors = mockProfiles.filter(p => p.role === 'mentor')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Geral"
        description="Central de inteligência operacional da Mentoria Residência"
        showDateBadge
        action={
          <Link href="/alunos/novo">
            <Button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm shadow-primary/25 hover:brightness-105">
              + Novo Aluno
            </Button>
          </Link>
        }
      />

      {/* KPI cards — first card orange gradient like the image */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total de Alunos"
          value={totalStudents}
          subtitle={`${activeStudents} ativos na plataforma`}
          icon={Users}
          variant="primary"
          trend={{ value: 12, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Alunos Ativos"
          value={activeStudents}
          subtitle="Com atividade recente"
          icon={UserCheck}
          variant="success"
          trend={{ value: 8.5, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Reuniões no Mês"
          value={meetingsThisMonth}
          subtitle={`${meetingsPending} pendentes`}
          icon={Calendar}
          variant="info"
          trend={{ value: 15, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Alertas Ativos"
          value={unreadAlerts}
          subtitle="Não resolvidos"
          icon={Bell}
          variant={unreadAlerts > 0 ? 'danger' : 'success'}
          trend={{ value: -3, label: 'vs semana passada' }}
        />
      </div>

      {/* Second row of cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Alunos Críticos"
          value={criticalStudents}
          subtitle="Necessitam atenção urgente"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Alunos Inativos"
          value={inactiveStudents}
          subtitle="Sem atividade recente"
          icon={UserX}
          variant="warning"
        />
        <StatCard
          title="Mentores"
          value={totalMentors}
          subtitle="Ativos na operação"
          icon={Stethoscope}
        />
        <StatCard
          title="Orientadores"
          value={totalOrientadores}
          subtitle="De estudo"
          icon={BookOpen}
        />
      </div>

      {/* Operational alerts banner */}
      {(studentsWithoutFutureMeeting > 0 || studentsWithDelayedMeeting > 0) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {studentsWithoutFutureMeeting > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800">
                  {studentsWithoutFutureMeeting} {studentsWithoutFutureMeeting === 1 ? 'aluno' : 'alunos'} sem reunião futura
                </p>
                <Link href="/alunos?filtro=sem_reuniao" className="text-xs text-red-600 hover:underline">Ver alunos →</Link>
              </div>
            </div>
          )}
          {studentsWithDelayedMeeting > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-100">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-800">
                  {studentsWithDelayedMeeting} {studentsWithDelayedMeeting === 1 ? 'aluno' : 'alunos'} com reunião atrasada
                </p>
                <Link href="/alunos?filtro=atrasados" className="text-xs text-yellow-700 hover:underline">Ver alunos →</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
          <CardHeader className="pb-1 pt-5 px-5">
            <CardTitle className="text-sm font-semibold">Status dos Alunos</CardTitle>
            <CardDescription className="text-xs">Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <StudentStatusPieChart />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
          <CardHeader className="pb-1 pt-5 px-5">
            <CardTitle className="text-sm font-semibold">Fase de Estudo</CardTitle>
            <CardDescription className="text-xs">Construção, Consolidação, Manutenção</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <StudyPhaseChart />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
          <CardHeader className="pb-1 pt-5 px-5">
            <CardTitle className="text-sm font-semibold">Reuniões por Mês</CardTitle>
            <CardDescription className="text-xs">Realizadas vs pendentes</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <MeetingsChart />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row — Risk ranking + Alerts + Mentors */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
          <CardHeader className="px-5 pb-3 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Ranking de Risco</CardTitle>
                <CardDescription className="text-xs">Alunos ordenados por nível de atenção</CardDescription>
              </div>
              <Link href="/alunos" className="text-xs font-medium text-primary hover:underline">Ver todos →</Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <StudentsRiskTable students={mockStudents} showMentor />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
            <CardHeader className="px-5 pb-3 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Alertas da Operação</CardTitle>
                  <CardDescription className="text-xs">{unreadAlerts} alertas não resolvidos</CardDescription>
                </div>
                <Link href="/alertas" className="text-xs font-medium text-primary hover:underline">Ver todos →</Link>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <AlertsPanel alerts={mockAlerts} maxItems={3} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="text-sm font-semibold">Mentores em Atividade</CardTitle>
              <CardDescription className="text-xs">Carteira de alunos por mentor</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-3">
                {mentors.map((mentor) => {
                  const ms = mockStudents.filter(s => s.mentor_id === mentor.id)
                  const crits = ms.filter(s => s.status === 'critico').length
                  const initials = mentor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                  return (
                    <div key={mentor.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{mentor.name}</p>
                        <p className="text-xs text-muted-foreground">{ms.length} alunos</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {crits > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                            <AlertTriangle className="h-3 w-3" />{crits}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {ms.filter(s => s.status === 'ativo').length} ativos
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
