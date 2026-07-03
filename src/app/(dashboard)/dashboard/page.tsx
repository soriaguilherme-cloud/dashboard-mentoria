'use client'

import type React from 'react'
import {
  Users, UserCheck, UserX, AlertTriangle, Calendar,
  Stethoscope, BookOpen, Bell, ClipboardList, CheckSquare, TrendingUp,
  FileText, ArrowRight,
} from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { PageHeader } from '@/components/shared/page-header'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { StudentsRiskTable } from '@/components/dashboard/students-risk-table'
import { MeetingsChart, StudentStatusPieChart, StudyPhaseChart } from '@/components/dashboard/evolution-chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { mockMedicalRecords, mockMeetings, mockProfiles } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import {
  getAlertsForUser,
  getDashboardCopy,
  getDashboardStatsForScope,
  getStudentsForUser,
} from '@/lib/access-control'
import {
  getDelayedChecklists,
  getFutureMeetingRate,
  getPendingRecordsByMentor,
  getPendingTopics,
  getPrepCourseComparison,
  getRecommendedAction,
  getStudentsByProfile,
  getWeeklySummaryForRole,
} from '@/lib/operational-intelligence'
import { Alert, Student, UserRole } from '@/types/database'

export default function DashboardPage() {
  const { user } = useAuth()
  const scopedStudents = getStudentsForUser(user)
  const scopedAlerts = getAlertsForUser(user)
  const dashboardCopy = getDashboardCopy(user?.role ?? 'coordenacao')
  const {
    totalStudents, activeStudents, inactiveStudents, criticalStudents,
    totalMentors, totalOrientadores,
    meetingsThisMonth, meetingsPending,
    studentsWithoutFutureMeeting, studentsWithDelayedMeeting,
    unreadAlerts
  } = getDashboardStatsForScope(scopedStudents, scopedAlerts)

  const mentors = mockProfiles.filter(p => {
    if (p.role !== 'mentor') return false
    return scopedStudents.some(student => student.mentor_id === p.id)
  })
  const canCreateStudent = user?.role === 'coordenacao' || user?.role === 'supervisor'

  return (
    <div className="space-y-6">
      <PageHeader
        title={dashboardCopy.title}
        description={dashboardCopy.description}
        showDateBadge
        action={
          canCreateStudent ? (
            <Link href="/alunos/novo">
              <Button className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm shadow-primary/25 hover:brightness-105">
                + Novo Aluno
              </Button>
            </Link>
          ) : (
            <Link href={user?.role === 'mentor' ? '/mentor' : '/guias'}>
              <Button variant="outline" className="h-9 rounded-lg px-4 text-sm font-semibold">
                Ver minha rotina
              </Button>
            </Link>
          )
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

      {user && (
        <RoleProfilePanel
          role={user.role}
          students={scopedStudents}
          alerts={scopedAlerts}
        />
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
            <StudentsRiskTable students={scopedStudents} showMentor={user?.role !== 'mentor'} />
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
              <AlertsPanel alerts={scopedAlerts} maxItems={3} />
            </CardContent>
          </Card>

          {user?.role === 'mentor' || user?.role === 'orientador' ? (
            <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-sm font-semibold">Próximas Ações</CardTitle>
                <CardDescription className="text-xs">Fila objetiva para o seu perfil</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-3">
                  {scopedStudents
                    .filter(student => student.status === 'critico' || !student.next_meeting_at || (student.days_since_last_meeting ?? 0) > 21)
                    .slice(0, 4)
                    .map(student => (
                      <div key={student.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {student.name.split(' ').map(part => part[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {!student.next_meeting_at
                              ? 'Agendar próxima reunião'
                              : student.status === 'critico'
                                ? 'Revisar plano de ação'
                                : 'Checar atraso de acompanhamento'}
                          </p>
                        </div>
                        <Link href={`/alunos/${student.id}`} className="text-xs font-medium text-primary hover:underline">
                          Abrir
                        </Link>
                      </div>
                    ))}
                  {scopedStudents.length === 0 && (
                    <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Nenhum aluno vinculado a este perfil.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="text-sm font-semibold">Mentores em Atividade</CardTitle>
                <CardDescription className="text-xs">Carteira de alunos por mentor</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-3">
                  {mentors.map((mentor) => {
                    const ms = scopedStudents.filter(s => s.mentor_id === mentor.id)
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
          )}
        </div>
      </div>
    </div>
  )
}

function RoleProfilePanel({
  role,
  students,
  alerts,
}: {
  role: UserRole
  students: Student[]
  alerts: Alert[]
}) {
  const studentIds = new Set(students.map(student => student.id))
  const pendingRecordMeetingIds = new Set(mockMedicalRecords.map(record => record.meeting_id))
  const pendingRecords = mockMeetings.filter(meeting =>
    studentIds.has(meeting.student_id) &&
    meeting.status === 'realizada' &&
    !pendingRecordMeetingIds.has(meeting.id)
  )
  const nextMeetings = mockMeetings
    .filter(meeting => studentIds.has(meeting.student_id) && meeting.status === 'agendada')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const criticalStudents = students
    .filter(student => student.status === 'critico' || student.risk_score >= 7)
    .sort((a, b) => b.risk_score - a.risk_score)

  if (role === 'mentor') {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RoleCard title="Próximos encontros" description="Agenda da carteira" icon={Calendar} href="/reunioes">
          <CompactList
            items={nextMeetings.slice(0, 4).map(meeting => ({
              title: meeting.student?.name ?? meeting.title,
              subtitle: new Date(meeting.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
              href: `/reunioes/${meeting.id}`,
            }))}
            empty="Nenhuma reunião futura. Agende o próximo encontro."
            emptyHref="/reunioes/nova"
          />
        </RoleCard>
        <RoleCard title="Alunos críticos" description="Prioridade clínica-operacional" icon={AlertTriangle} href="/alunos">
          <CompactList
            items={criticalStudents.slice(0, 4).map(student => ({
              title: student.name,
              subtitle: getRecommendedAction(student),
              href: `/alunos/${student.id}`,
              badge: `Risco ${student.risk_score}`,
            }))}
            empty="Nenhum aluno crítico na sua carteira."
          />
        </RoleCard>
        <RoleCard title="Prontuários pendentes" description="Pós-reunião sem registro" icon={ClipboardList} href="/prontuarios">
          <CompactList
            items={pendingRecords.slice(0, 4).map(meeting => ({
              title: meeting.student?.name ?? meeting.title,
              subtitle: 'Registrar prontuário pós-reunião',
              href: `/reunioes/${meeting.id}?tab=prontuario`,
            }))}
            empty="Todos os prontuários estão em dia."
          />
        </RoleCard>
      </div>
    )
  }

  if (role === 'supervisor') {
    const mentors = mockProfiles
      .filter(profile => profile.role === 'mentor')
      .map(profile => ({
        profile,
        students: getStudentsByProfile(profile, students),
      }))
      .filter(item => item.students.length > 0)
    const studentsWithoutMeeting = students.filter(student => !student.next_meeting_at)

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RoleCard title="Mentores acompanhados" description="Carteira e risco por mentor" icon={Stethoscope} href="/supervisao">
          <CompactList
            items={mentors.map(item => ({
              title: item.profile.name,
              subtitle: `${item.students.length} alunos · ${item.students.filter(student => student.status === 'critico').length} críticos`,
              href: '/supervisao',
            }))}
            empty="Nenhum mentor no escopo."
          />
        </RoleCard>
        <RoleCard title="Alunos sem reunião" description="Fila de agendamento" icon={Calendar} href="/alunos?filtro=sem_reuniao">
          <CompactList
            items={studentsWithoutMeeting.slice(0, 4).map(student => ({
              title: student.name,
              subtitle: student.mentor?.name ?? 'Sem mentor',
              href: `/reunioes/nova?aluno=${student.id}`,
              badge: 'Agendar',
            }))}
            empty="Todos os alunos têm reunião futura."
          />
        </RoleCard>
        <RoleCard title="Alertas por equipe" description="Gravidade no escopo" icon={Bell} href="/alertas">
          <CompactList
            items={alerts.filter(alert => !alert.is_resolved).slice(0, 4).map(alert => ({
              title: alert.title,
              subtitle: alert.description ?? 'Alerta ativo',
              href: alert.student_id ? `/alunos/${alert.student_id}` : '/alertas',
              badge: alert.severity === 'critical' ? 'Crítico' : 'Atenção',
            }))}
            empty="Nenhum alerta ativo."
          />
        </RoleCard>
      </div>
    )
  }

  if (role === 'orientador') {
    const delayedChecklists = getDelayedChecklists(students)
    const pendingTopics = getPendingTopics(students)

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RoleCard title="Checklists atrasados" description="Pendências semanais" icon={CheckSquare} href="/checklists">
          <CompactList
            items={delayedChecklists.slice(0, 4).map(checklist => ({
              title: checklist.student?.name ?? 'Aluno',
              subtitle: checklist.pending_items || checklist.weekly_goals || 'Checklist em aberto',
              href: '/checklists',
              badge: checklist.status === 'pendente' ? 'Pendente' : 'Em andamento',
            }))}
            empty="Nenhum checklist atrasado."
          />
        </RoleCard>
        <RoleCard title="Temas pendentes" description="Alta incidência e revisão" icon={BookOpen} href="/temas">
          <CompactList
            items={pendingTopics.slice(0, 4).map(topic => ({
              title: topic.topic?.name ?? 'Tema',
              subtitle: `${topic.topic?.area ?? 'Área'} · ${topic.phase}`,
              href: '/temas',
              badge: topic.topic?.importance === 'alta' ? 'Alta' : undefined,
            }))}
            empty="Nenhum tema pendente."
          />
        </RoleCard>
        <RoleCard title="Guias de estudo" description="Sugestões para enviar" icon={FileText} href="/guias">
          <CompactList
            items={students.slice(0, 4).map(student => ({
              title: student.name,
              subtitle: getRecommendedAction(student),
              href: `/alunos/${student.id}?tab=relatorios`,
            }))}
            empty="Nenhum aluno no escopo."
          />
        </RoleCard>
      </div>
    )
  }

  const pendingByMentor = getPendingRecordsByMentor(students)
  const prepCourses = getPrepCourseComparison(students)
  const futureMeetingRate = getFutureMeetingRate(students)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <RoleCard title="Visão executiva" description={getWeeklySummaryForRole(role, students, alerts)} icon={TrendingUp} href="/relatorios">
        <div className="space-y-3">
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Alunos com reunião futura</p>
            <p className="text-2xl font-bold text-primary">{futureMeetingRate}%</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Alertas ativos</p>
            <p className="text-2xl font-bold text-red-600">{alerts.filter(alert => !alert.is_resolved).length}</p>
          </div>
        </div>
      </RoleCard>
      <RoleCard title="Prontuários por mentor" description="Pendências pós-reunião" icon={ClipboardList} href="/prontuarios">
        <CompactList
          items={pendingByMentor.map(item => ({
            title: item.mentor.name,
            subtitle: `${item.pending} prontuário${item.pending > 1 ? 's' : ''} pendente${item.pending > 1 ? 's' : ''}`,
            href: '/prontuarios',
          }))}
          empty="Sem prontuários pendentes por mentor."
        />
      </RoleCard>
      <RoleCard title="Comparativo por cursinho" description="Risco médio por preparatório" icon={BookOpen} href="/relatorios">
        <CompactList
          items={prepCourses.map(item => ({
            title: item.course.name,
            subtitle: `${item.students} alunos · ${item.critical} críticos`,
            href: '/relatorios',
            badge: `Risco ${item.avgRisk}`,
          }))}
          empty="Sem dados por cursinho."
        />
      </RoleCard>
    </div>
  )
}

function RoleCard({
  title,
  description,
  icon: Icon,
  href,
  children,
}: {
  title: string
  description: string
  icon: typeof Calendar
  href: string
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-2xl border-border/50 bg-white shadow-sm">
      <CardHeader className="px-5 pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-xs">{description}</CardDescription>
          </div>
          <Link href={href} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">{children}</CardContent>
    </Card>
  )
}

function CompactList({
  items,
  empty,
  emptyHref,
}: {
  items: Array<{ title: string; subtitle: string; href: string; badge?: string }>
  empty: string
  emptyHref?: string
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
        <p>{empty}</p>
        {emptyHref && (
          <Link href={emptyHref} className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">
            Criar agora
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <Link
          key={`${item.href}-${item.title}`}
          href={item.href}
          className="flex items-center justify-between gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/30"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{item.title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{item.subtitle}</p>
          </div>
          {item.badge && (
            <span className="flex-shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
