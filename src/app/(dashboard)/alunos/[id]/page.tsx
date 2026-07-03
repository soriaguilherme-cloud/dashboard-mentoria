'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  mockStudents, mockMeetings, mockMedicalRecords, mockGoals,
  mockWeeklyChecklists, mockStudentTopics, mockMonthlyReports
} from '@/lib/mock-data'
import {
  buildStudentTimeline,
  getRecommendedAction,
  getRiskExplanation,
  getRiskEvolution,
  getStudentTags,
  TimelineItem,
} from '@/lib/operational-intelligence'
import {
  getCommunicationHistory,
  getInternalStudentSummary,
  getOperationalChecklist,
  getStudentDocuments,
} from '@/lib/internal-operations'
import { StudentStatusBadge, ActivityBadge, RiskScore, StudyPhaseBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft, Calendar, Clock, Target, BookOpen, ClipboardList,
  CheckSquare, AlertTriangle, CheckCircle2, XCircle,
  FileText, BarChart2, Plus, Edit, Stethoscope, Users, Send, Activity,
  MessageSquare, ShieldCheck, ClipboardCheck
} from 'lucide-react'

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const student = mockStudents.find(s => s.id === id)
  if (!student) notFound()

  const meetings = mockMeetings.filter(m => m.student_id === id)
  const records = mockMedicalRecords.filter(r => r.student_id === id)
  const goals = mockGoals.filter(g => g.student_id === id)
  const checklists = mockWeeklyChecklists.filter(c => c.student_id === id)
  const studentTopics = mockStudentTopics.filter(t => t.student_id === id)
  const reports = mockMonthlyReports.filter(r => r.student_id === id)
  const timeline = buildStudentTimeline(id)
  const riskEvolution = getRiskEvolution(id)
  const tags = getStudentTags(student)
  const internalSummary = getInternalStudentSummary(student)
  const operationalChecklist = getOperationalChecklist(student)
  const studentDocuments = getStudentDocuments(student.id)
  const communicationHistory = getCommunicationHistory(student.id)

  const pendingGoals = goals.filter(g => !g.is_completed)
  const completedGoals = goals.filter(g => g.is_completed)
  const seenTopics = studentTopics.filter(t => t.status === 'visto')
  const pendingTopics = studentTopics.filter(t => t.status === 'pendente')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/alunos" className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Alunos
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{student.name}</span>
      </div>

      {/* Header do aluno */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <StudentStatusBadge status={student.status} />
              <RiskScore score={student.risk_score} />
            </div>
            <p className="text-muted-foreground mt-1">
              {student.desired_specialty} · {student.target_exam} · {student.target_institution}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <Badge
                  key={tag.label}
                  variant="secondary"
                  className={`text-xs ${
                    tag.tone === 'red' ? 'bg-red-50 text-red-700' :
                    tag.tone === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
                    tag.tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                    tag.tone === 'blue' ? 'bg-blue-50 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" />
                Mentor: <strong className="text-foreground">{student.mentor?.name || '—'}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Orientador: <strong className="text-foreground">{student.orientador?.name || '—'}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Supervisor: <strong className="text-foreground">{student.supervisor?.name || '—'}</strong>
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" /> Editar
          </Button>
          <Link href={`/reunioes/nova?aluno=${student.id}`}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Nova Reunião
            </Button>
          </Link>
        </div>
      </div>

      {/* Alertas do aluno */}
      {student.alerts && student.alerts.length > 0 && (
        <div className="space-y-2">
          {student.alerts.map(alert => (
            <div key={alert.id} className="flex items-center gap-3 rounded-lg border-l-4 border-l-red-500 bg-red-50 p-3">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-800">{alert.title}</p>
            </div>
          ))}
        </div>
      )}

      <Card className="border-l-4 border-l-primary bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Central interna do aluno
              </CardTitle>
              <CardDescription>
                Visão do time sobre risco, operação, documentos e próxima decisão. O aluno não acessa esta área.
              </CardDescription>
            </div>
            <Link href="/operacao">
              <Button variant="outline" size="sm">Ver operação</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr_1fr]">
          <div className="rounded-xl bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Próxima ação</p>
            <p className="mt-2 text-sm font-semibold">{internalSummary.recommendedAction}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{internalSummary.internalNote}</p>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Checklist interno</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{internalSummary.completion}%</span>
            </div>
            <div className="space-y-2">
              {operationalChecklist.slice(0, 4).map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    ) : (
                      <Clock className="h-4 w-4 flex-shrink-0 text-yellow-600" />
                    )}
                    <p className="truncate text-sm">{item.label}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">{item.owner}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Último envio/combinado</p>
            {internalSummary.latestCommunication ? (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{internalSummary.latestCommunication.title}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{internalSummary.latestCommunication.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {internalSummary.latestCommunication.channel} · {internalSummary.latestCommunication.owner}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma comunicação registrada ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de situação rápida */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Última Reunião</p>
            {student.last_meeting_at ? (
              <>
                <p className="text-sm font-semibold mt-1">
                  {format(new Date(student.last_meeting_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(student.last_meeting_at), { locale: ptBR, addSuffix: true })}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-red-500 mt-1">Nunca realizada</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Próxima Reunião</p>
            {student.next_meeting_at ? (
              <>
                <p className="text-sm font-semibold mt-1">
                  {format(new Date(student.next_meeting_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(student.next_meeting_at), { locale: ptBR, addSuffix: true })}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Sem reunião marcada
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Fase de Estudo</p>
            <div className="mt-1">
              <StudyPhaseBadge phase={student.study_phase} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{student.prep_course?.name || '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Atividade</p>
            <div className="mt-1">
              <ActivityBadge level={student.activity_level} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {goals.filter(g => !g.is_completed).length} metas pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Score de risco explicável
            </CardTitle>
            <CardDescription>Motivos usados para classificar a prioridade do aluno.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <RiskScore score={student.risk_score} />
              <p className="text-sm font-medium">{getRiskExplanation(student)}</p>
            </div>
            {riskEvolution.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {riskEvolution.map(point => (
                  <div key={point.label} className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{point.label}</p>
                    <p className="mt-1 text-lg font-bold">{point.risk}/10</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Próxima ação recomendada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="rounded-xl bg-primary/5 p-4 text-sm font-semibold text-primary">
              {getRecommendedAction(student)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas principais */}
      <Tabs defaultValue="prontuario">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="prontuario">Prontuário</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="reunioes">Reuniões</TabsTrigger>
          <TabsTrigger value="metas">Metas</TabsTrigger>
          <TabsTrigger value="temas">Temas</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* ABA: PRONTUÁRIO */}
        <TabsContent value="prontuario" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Prontuário Longitudinal</h3>
              <p className="text-sm text-muted-foreground">Histórico completo da jornada do aluno</p>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Novo Registro
            </Button>
          </div>

          {records.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum prontuário registrado ainda.</p>
                <p className="text-sm mt-1">Após a primeira reunião, registre o prontuário aqui.</p>
              </CardContent>
            </Card>
          ) : (
            records.map(record => (
              <Card key={record.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Prontuário — {format(new Date(record.record_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                      <CardDescription>Mentor: {record.mentor?.name} {record.ai_generated && <Badge variant="secondary" className="ml-2 text-xs">Gerado por IA</Badge>}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MedicalRecordSection title="Resumo da Reunião" content={record.meeting_summary} />
                  <MedicalRecordSection title="Contexto Atual" content={record.current_context} />
                  <div className="grid grid-cols-2 gap-4">
                    <MedicalRecordSection title="Principais Dificuldades" content={record.main_difficulties} icon={<XCircle className="h-4 w-4 text-red-500" />} />
                    <MedicalRecordSection title="Principais Avanços" content={record.main_advances} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MedicalRecordSection title="Metas Combinadas" content={record.goals} />
                    <MedicalRecordSection title="Próximos Passos" content={record.next_steps} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MedicalRecordSection title="O que funcionou" content={record.what_worked} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} />
                    <MedicalRecordSection title="O que não funcionou" content={record.what_didnt_work} icon={<XCircle className="h-4 w-4 text-red-500" />} />
                  </div>
                  {record.attention_points && (
                    <div className="rounded-lg border-l-4 border-l-yellow-500 bg-yellow-50 p-3">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">Pontos de Atenção</p>
                      <p className="text-sm text-yellow-900 whitespace-pre-line">{record.attention_points}</p>
                    </div>
                  )}
                  {record.next_meeting_referrals && (
                    <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Encaminhamentos para Próxima Reunião</p>
                      <p className="text-sm text-blue-900 whitespace-pre-line">{record.next_meeting_referrals}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ABA: TIMELINE */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Timeline do Aluno</h3>
              <p className="text-sm text-muted-foreground">Reuniões, prontuários, checklists, metas e alertas em uma linha do tempo.</p>
            </div>
            <Link href={`/reunioes/nova?aluno=${id}`}>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nova ação
              </Button>
            </Link>
          </div>

          {timeline.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum evento registrado ainda.</p>
                <Link href={`/reunioes/nova?aluno=${id}`}>
                  <Button variant="outline" size="sm" className="mt-3">Agendar primeira reunião</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {timeline.map(item => (
                    <TimelineRow key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ABA: REUNIÕES */}
        <TabsContent value="reunioes" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Histórico de Reuniões</h3>
            <Link href={`/reunioes/nova?aluno=${id}`}>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Agendar Reunião
              </Button>
            </Link>
          </div>
          {meetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma reunião registrada.</p>
              </CardContent>
            </Card>
          ) : (
            meetings.map(meeting => (
              <Card key={meeting.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          meeting.status === 'realizada' ? 'bg-emerald-100 text-emerald-800' :
                          meeting.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {meeting.status === 'realizada' ? 'Realizada' : meeting.status === 'agendada' ? 'Agendada' : 'Cancelada'}
                        </span>
                        <span className="text-sm font-medium">{meeting.title}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(meeting.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {meeting.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {meeting.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/reunioes/${meeting.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        {meeting.status === 'realizada' ? 'Ver Prontuário' : 'Ver Detalhes'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ABA: METAS */}
        <TabsContent value="metas" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Metas do Aluno</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Nova Meta
            </Button>
          </div>
          <div className="grid gap-3">
            {pendingGoals.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Pendentes ({pendingGoals.length})
                </p>
                <div className="space-y-2">
                  {pendingGoals.map(goal => (
                    <Card key={goal.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="p-3 flex items-start gap-3">
                        <Target className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{goal.title}</p>
                          {goal.description && <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>}
                          {goal.due_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Prazo: {format(new Date(goal.due_date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {completedGoals.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Concluídas ({completedGoals.length})
                </p>
                <div className="space-y-2">
                  {completedGoals.map(goal => (
                    <Card key={goal.id} className="border-l-4 border-l-emerald-400 opacity-70">
                      <CardContent className="p-3 flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium line-through text-muted-foreground">{goal.title}</p>
                          {goal.completed_at && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Concluída em {format(new Date(goal.completed_at), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {goals.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma meta registrada.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ABA: TEMAS */}
        <TabsContent value="temas" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Temas de Estudo</h3>
              <p className="text-sm text-muted-foreground">
                {seenTopics.length} vistos · {pendingTopics.length} pendentes
              </p>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar Tema
            </Button>
          </div>

          {studentTopics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum tema cadastrado para este aluno.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {studentTopics.map(st => (
                <Card key={st.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      st.status === 'visto' ? 'bg-emerald-500' :
                      st.status === 'em_revisao' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{st.topic?.name}</p>
                        {st.topic?.incidence_score && st.topic.incidence_score >= 8 && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                            Alta incidência
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {st.topic?.area} · {st.topic?.sub_area}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StudyPhaseBadge phase={st.phase} />
                      {st.performance_score && (
                        <span className={`text-xs font-semibold ${
                          st.performance_score >= 70 ? 'text-emerald-600' :
                          st.performance_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {st.performance_score}%
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ABA: CHECKLISTS */}
        <TabsContent value="checklists" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Checklists Semanais</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Novo Checklist
            </Button>
          </div>
          {checklists.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum checklist registrado.</p>
              </CardContent>
            </Card>
          ) : (
            checklists.map(checklist => (
              <Card key={checklist.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Semana {format(new Date(checklist.week_start), "dd/MM", { locale: ptBR })} – {format(new Date(checklist.week_end), "dd/MM/yyyy", { locale: ptBR })}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      checklist.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' :
                      checklist.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {checklist.status === 'concluido' ? 'Concluído' : checklist.status === 'em_andamento' ? 'Em andamento' : 'Pendente'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checklist.weekly_goals && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Metas da semana</p>
                      <p className="text-sm">{checklist.weekly_goals}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Temas previstos</p>
                      <p>{checklist.planned_topics || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Temas concluídos</p>
                      <p>{checklist.completed_topics || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span>Simulados: <strong>{checklist.simulations_done || 0}</strong></span>
                    <span>Revisões: <strong>{checklist.revisions_done || 0}</strong></span>
                    <span>Horas: <strong>{checklist.study_hours || 0}h</strong></span>
                  </div>
                  {checklist.pending_items && (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2.5">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">Pendências</p>
                      <p className="text-sm text-yellow-900">{checklist.pending_items}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ABA: RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Relatórios e Guias do Aluno</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Novo Relatório
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Guias pós-reunião enviados ao aluno</CardTitle>
              <CardDescription>Histórico dos documentos no modelo do guia de estudos.</CardDescription>
            </CardHeader>
            <CardContent>
              {studentDocuments.length > 0 ? (
                <div className="space-y-3">
                  {studentDocuments.map(document => (
                    <div key={document.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{document.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(document.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            {document.reviewedBy ? ` · revisado por ${document.reviewedBy}` : ' · aguardando revisão'}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{document.internalNote}</p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          document.status === 'enviado' ? 'bg-emerald-100 text-emerald-700' :
                          document.status === 'revisado' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {document.status === 'enviado' ? <Send className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                          {document.status === 'enviado'
                            ? `Enviado ${document.sentAt ? format(new Date(document.sentAt), 'dd/MM', { locale: ptBR }) : ''}`
                            : document.status === 'revisado'
                              ? 'Revisado'
                              : 'Rascunho'}
                        </span>
                        <Link href={document.meetingId ? `/reunioes/${document.meetingId}/relatorio-aluno` : `/alunos/${student.id}`}>
                          <Button variant="outline" size="sm">
                            Abrir guia
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  Nenhum guia pós-reunião gerado ainda.
                </div>
              )}
            </CardContent>
          </Card>

          {reports.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tabela Comparativa de Evolução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Mês</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Horas</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Acertos</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Simulados</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">Temas OK</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Evolução</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r.id} className="border-b hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-medium">
                            {new Date(r.year, r.month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-3 text-right">{r.study_hours || '—'}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`font-semibold ${(r.accuracy_percentage || 0) >= 70 ? 'text-emerald-600' : 'text-yellow-600'}`}>
                              {r.accuracy_percentage ? `${r.accuracy_percentage}%` : '—'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">{r.simulations_count || '—'}</td>
                          <td className="py-2.5 px-3 text-right">{r.topics_completed || '—'}</td>
                          <td className="py-2.5 px-3 text-xs text-muted-foreground">{r.perceived_evolution || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          {reports.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum relatório registrado ainda.</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Histórico de comunicação</CardTitle>
              <CardDescription>Registro interno do que foi enviado ou combinado fora do sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              {communicationHistory.length > 0 ? (
                <div className="space-y-3">
                  {communicationHistory.map(log => (
                    <div key={log.id} className="rounded-xl border border-border/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <MessageSquare className="h-4 w-4 flex-shrink-0 text-primary" />
                          <p className="truncate text-sm font-semibold">{log.title}</p>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          {log.channel}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{log.summary}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {log.owner} · {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  Nenhuma comunicação registrada para este aluno.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MedicalRecordSection({
  title,
  content,
  icon
}: {
  title: string
  content?: string
  icon?: React.ReactNode
}) {
  if (!content) return null
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
        {icon}{title}
      </p>
      <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  )
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const dotClass = item.tone === 'red' ? 'bg-red-500' :
    item.tone === 'yellow' ? 'bg-yellow-500' :
    item.tone === 'emerald' ? 'bg-emerald-500' :
    item.tone === 'blue' ? 'bg-blue-500' :
    'bg-slate-500'

  const content = (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`mt-1 h-3 w-3 rounded-full ${dotClass}`} />
        <span className="mt-2 h-full w-px bg-border" />
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-border/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">{item.type}</Badge>
          <p className="text-xs text-muted-foreground">
            {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold">{item.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
      </div>
    </div>
  )

  if (!item.href) return content

  return (
    <Link href={item.href} className="block transition-colors hover:bg-muted/20">
      {content}
    </Link>
  )
}
