import {
  mockAlerts,
  mockGoals,
  mockMedicalRecords,
  mockMeetings,
  mockMonthlyReports,
  mockPrepCourses,
  mockProfiles,
  mockStudentTopics,
  mockWeeklyChecklists,
} from '@/lib/mock-data'
import { Alert, Profile, Student, UserRole } from '@/types/database'

export type StudentTag = {
  label: string
  tone: 'red' | 'yellow' | 'emerald' | 'blue' | 'slate'
}

export type TimelineItem = {
  id: string
  date: string
  type: 'reuniao' | 'prontuario' | 'checklist' | 'meta' | 'alerta'
  title: string
  description: string
  href?: string
  tone: StudentTag['tone']
}

const severityWeight = {
  critical: 3,
  warning: 2,
  info: 1,
}

const referenceDate = new Date('2025-07-02T12:00:00')

export function getRiskExplanation(student: Student) {
  const reasons: string[] = []

  if (!student.next_meeting_at) reasons.push('sem reunião futura')
  if ((student.days_since_last_meeting ?? 0) > 21) reasons.push(`${student.days_since_last_meeting} dias sem reunião`)
  if (student.activity_level === 'baixo') reasons.push('baixo engajamento')
  if (student.status === 'critico') reasons.push('marcado como crítico')
  if (student.risk_score >= 8) reasons.push('score de risco elevado')

  return reasons.length > 0 ? reasons.join(' + ') : 'acompanhamento dentro do esperado'
}

export function getRecommendedAction(student: Student) {
  if (!student.next_meeting_at) return 'Agendar reunião de retomada'
  if (student.status === 'critico') return 'Revisar plano com mentor e supervisor'
  if ((student.days_since_last_meeting ?? 0) > 21) return 'Checar atraso de acompanhamento'
  if (student.activity_level === 'baixo') return 'Cobrar checklist e rotina semanal'
  if (student.risk_score <= 2 && student.activity_level === 'alto') return 'Manter ritmo e elevar desafio'
  return 'Manter acompanhamento programado'
}

export function getStudentTags(student: Student): StudentTag[] {
  const tags: StudentTag[] = []

  if (!student.next_meeting_at) tags.push({ label: 'sem reunião', tone: 'red' })
  if (student.activity_level === 'baixo') tags.push({ label: 'baixo engajamento', tone: 'yellow' })
  if (student.risk_score <= 2 && student.activity_level === 'alto') tags.push({ label: 'alto potencial', tone: 'emerald' })
  if (student.status === 'critico' || student.risk_score >= 7) tags.push({ label: 'precisa revisão', tone: 'red' })
  if (tags.length === 0) tags.push({ label: 'em acompanhamento', tone: 'blue' })

  return tags
}

export function buildStudentTimeline(studentId: string): TimelineItem[] {
  const meetings = mockMeetings
    .filter(meeting => meeting.student_id === studentId)
    .map<TimelineItem>(meeting => ({
      id: `meeting-${meeting.id}`,
      date: meeting.scheduled_at,
      type: 'reuniao',
      title: meeting.status === 'agendada' ? 'Reunião agendada' : 'Reunião realizada',
      description: meeting.title,
      href: `/reunioes/${meeting.id}`,
      tone: meeting.status === 'agendada' ? 'blue' : 'emerald',
    }))

  const records = mockMedicalRecords
    .filter(record => record.student_id === studentId)
    .map<TimelineItem>(record => ({
      id: `record-${record.id}`,
      date: record.record_date,
      type: 'prontuario',
      title: record.is_approved ? 'Prontuário aprovado' : 'Prontuário pendente',
      description: record.meeting_summary ?? 'Registro pós-reunião',
      href: record.meeting_id ? `/reunioes/${record.meeting_id}` : undefined,
      tone: record.is_approved ? 'emerald' : 'yellow',
    }))

  const checklists = mockWeeklyChecklists
    .filter(checklist => checklist.student_id === studentId)
    .map<TimelineItem>(checklist => ({
      id: `checklist-${checklist.id}`,
      date: checklist.week_end,
      type: 'checklist',
      title: checklist.status === 'concluido' ? 'Checklist concluído' : 'Checklist pendente',
      description: checklist.pending_items || checklist.weekly_goals || 'Checklist semanal',
      href: '/checklists',
      tone: checklist.status === 'concluido' ? 'emerald' : 'yellow',
    }))

  const goals = mockGoals
    .filter(goal => goal.student_id === studentId)
    .map<TimelineItem>(goal => ({
      id: `goal-${goal.id}`,
      date: goal.completed_at ?? goal.due_date ?? goal.created_at,
      type: 'meta',
      title: goal.is_completed ? 'Meta concluída' : 'Meta definida',
      description: goal.title,
      tone: goal.is_completed ? 'emerald' : 'blue',
    }))

  const alerts = mockAlerts
    .filter(alert => alert.student_id === studentId)
    .map<TimelineItem>(alert => ({
      id: `alert-${alert.id}`,
      date: alert.created_at,
      type: 'alerta',
      title: alert.title,
      description: alert.description ?? 'Alerta operacional',
      href: '/alertas',
      tone: alert.severity === 'critical' ? 'red' : 'yellow',
    }))

  return [...meetings, ...records, ...checklists, ...goals, ...alerts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRiskEvolution(studentId: string) {
  const reports = mockMonthlyReports
    .filter(report => report.student_id === studentId)
    .sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year)

  if (reports.length === 0) return []

  return reports.map(report => {
    const accuracy = report.accuracy_percentage ?? 0
    const pending = report.topics_pending ?? 0
    const risk = Math.max(1, Math.min(10, Math.round(10 - accuracy / 12 + pending / 4)))

    return {
      label: `${String(report.month).padStart(2, '0')}/${report.year}`,
      risk,
    }
  })
}

export function getFutureMeetingRate(students: Student[]) {
  if (students.length === 0) return 0
  return Math.round((students.filter(student => !!student.next_meeting_at).length / students.length) * 100)
}

export function getPendingRecordsByMentor(students: Student[]) {
  const studentIds = new Set(students.map(student => student.id))

  return mockProfiles
    .filter(profile => profile.role === 'mentor')
    .map(mentor => {
      const completedMeetingIds = new Set(
        mockMedicalRecords
          .filter(record => record.mentor_id === mentor.id)
          .map(record => record.meeting_id)
      )
      const pending = mockMeetings.filter(meeting =>
        meeting.mentor_id === mentor.id &&
        studentIds.has(meeting.student_id) &&
        meeting.status === 'realizada' &&
        !completedMeetingIds.has(meeting.id)
      ).length

      return { mentor, pending }
    })
    .filter(item => item.pending > 0)
}

export function getChecklistCompletionByWeek(students: Student[]) {
  const studentIds = new Set(students.map(student => student.id))
  const grouped = new Map<string, { total: number; completed: number }>()

  mockWeeklyChecklists
    .filter(checklist => studentIds.has(checklist.student_id))
    .forEach(checklist => {
      const current = grouped.get(checklist.week_start) ?? { total: 0, completed: 0 }
      current.total += 1
      if (checklist.status === 'concluido') current.completed += 1
      grouped.set(checklist.week_start, current)
    })

  return Array.from(grouped.entries()).map(([week, value]) => ({
    week,
    total: value.total,
    completed: value.completed,
    rate: value.total > 0 ? Math.round((value.completed / value.total) * 100) : 0,
  }))
}

export function getPrepCourseComparison(students: Student[]) {
  return mockPrepCourses
    .map(course => {
      const courseStudents = students.filter(student => student.prep_course_id === course.id)
      const avgRisk = courseStudents.length
        ? Math.round(courseStudents.reduce((sum, student) => sum + student.risk_score, 0) / courseStudents.length)
        : 0

      return {
        course,
        students: courseStudents.length,
        avgRisk,
        critical: courseStudents.filter(student => student.status === 'critico').length,
      }
    })
    .filter(item => item.students > 0)
}

export function getDelayedChecklists(students: Student[]) {
  const studentIds = new Set(students.map(student => student.id))
  return mockWeeklyChecklists.filter(checklist =>
    studentIds.has(checklist.student_id) && checklist.status !== 'concluido'
  )
}

export function getPendingTopics(students: Student[]) {
  const studentIds = new Set(students.map(student => student.id))
  return mockStudentTopics.filter(topic =>
    studentIds.has(topic.student_id) && topic.status !== 'visto'
  )
}

export function prioritizeAlerts(alerts: Alert[]) {
  return [...alerts].sort((a, b) => {
    const bySeverity = severityWeight[b.severity] - severityWeight[a.severity]
    if (bySeverity !== 0) return bySeverity
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

export function getAlertPriority(alert: Alert) {
  const daysOpen = Math.max(1, Math.ceil((referenceDate.getTime() - new Date(alert.created_at).getTime()) / 86400000))
  return severityWeight[alert.severity] * 10 + Math.min(daysOpen, 10)
}

export function groupRepeatedAlerts(alerts: Alert[]) {
  const groups = new Map<string, Alert[]>()

  alerts.forEach(alert => {
    const key = `${alert.type}-${alert.mentor_id ?? 'student'}`
    groups.set(key, [...(groups.get(key) ?? []), alert])
  })

  return Array.from(groups.values())
    .filter(group => group.length > 1)
    .map(group => ({
      type: group[0].type,
      title: group[0].title,
      count: group.length,
      severity: group.some(alert => alert.severity === 'critical') ? 'critical' as const : group[0].severity,
    }))
}

export function getPreMeetingSuggestions(student?: Student) {
  if (!student) return []

  const suggestions = [
    `Revisar risco: ${getRiskExplanation(student)}.`,
    `Próxima ação sugerida: ${getRecommendedAction(student)}.`,
  ]

  if (student.desired_specialty) suggestions.push(`Conectar pauta com a especialidade desejada: ${student.desired_specialty}.`)
  if (student.activity_level === 'baixo') suggestions.push('Checar barreiras da rotina e combinar uma meta pequena para a semana.')
  if (!student.next_meeting_at) suggestions.push('Sair da reunião com próxima data já marcada.')

  return suggestions
}

export function getWeeklySummaryForRole(role: UserRole, students: Student[], alerts: Alert[]) {
  const futureMeetingRate = getFutureMeetingRate(students)
  const unresolved = alerts.filter(alert => !alert.is_resolved).length
  const critical = students.filter(student => student.status === 'critico').length

  if (role === 'mentor') {
    return `${students.length} alunos na carteira, ${critical} críticos e ${futureMeetingRate}% com reunião futura.`
  }

  if (role === 'orientador') {
    return `${getDelayedChecklists(students).length} checklists pendentes e ${getPendingTopics(students).length} temas aguardando avanço.`
  }

  if (role === 'supervisor') {
    return `${critical} alunos críticos, ${unresolved} alertas ativos e ${futureMeetingRate}% da carteira com reunião futura.`
  }

  return `${students.length} alunos acompanhados, ${futureMeetingRate}% com reunião futura e ${unresolved} alertas ativos.`
}

export function getStudentsByProfile(profile: Profile, students: Student[]) {
  if (profile.role === 'mentor') return students.filter(student => student.mentor_id === profile.id)
  if (profile.role === 'orientador') return students.filter(student => student.orientador_id === profile.id)
  if (profile.role === 'supervisor') return students.filter(student => student.supervisor_id === profile.id)
  return students
}
