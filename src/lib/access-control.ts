import {
  Alert,
  Student,
  UserRole,
} from '@/types/database'
import { AuthUser } from '@/lib/auth-context'
import {
  mockAlerts,
  mockMeetings,
  mockProfiles,
  mockStudents,
} from '@/lib/mock-data'

export const roleLabel: Record<UserRole, string> = {
  coordenacao: 'Coordenação',
  supervisor: 'Supervisor',
  mentor: 'Mentor',
  orientador: 'Orientador de Estudo',
}

export const roleDescription: Record<UserRole, string> = {
  coordenacao: 'Visão executiva completa da operação',
  supervisor: 'Supervisão da qualidade e dos riscos da carteira',
  mentor: 'Acompanhamento da sua carteira de alunos',
  orientador: 'Rotina de estudo, checklists e guias dos alunos',
}

export const roleHome: Record<UserRole, string> = {
  coordenacao: '/dashboard',
  supervisor: '/supervisao',
  mentor: '/mentor',
  orientador: '/guias',
}

const roleRoutes: Record<UserRole, string[]> = {
  coordenacao: [
    '/dashboard',
    '/operacao',
    '/mentor',
    '/supervisao',
    '/alunos',
    '/reunioes',
    '/prontuarios',
    '/checklists',
    '/cursinhos',
    '/temas',
    '/guias',
    '/relatorios',
    '/oficinas',
    '/alertas',
    '/configuracoes',
  ],
  supervisor: [
    '/dashboard',
    '/operacao',
    '/supervisao',
    '/alunos',
    '/reunioes',
    '/prontuarios',
    '/checklists',
    '/temas',
    '/relatorios',
    '/alertas',
    '/configuracoes',
  ],
  mentor: [
    '/dashboard',
    '/operacao',
    '/mentor',
    '/alunos',
    '/reunioes',
    '/prontuarios',
    '/checklists',
    '/guias',
    '/alertas',
    '/configuracoes',
  ],
  orientador: [
    '/dashboard',
    '/operacao',
    '/alunos',
    '/checklists',
    '/temas',
    '/guias',
    '/relatorios',
    '/alertas',
    '/configuracoes',
  ],
}

export function getAllowedRoutes(role: UserRole) {
  return roleRoutes[role]
}

export function getRoleHome(role: UserRole) {
  return roleHome[role]
}

export function canAccessPath(role: UserRole, pathname: string) {
  return roleRoutes[role].some(route => pathname === route || pathname.startsWith(`${route}/`))
}

export function getStudentsForUser(user: AuthUser | null): Student[] {
  if (!user) return []

  if (user.role === 'coordenacao') return mockStudents
  if (user.role === 'supervisor') return mockStudents.filter(student => student.supervisor_id === user.id)
  if (user.role === 'mentor') return mockStudents.filter(student => student.mentor_id === user.id)
  return mockStudents.filter(student => student.orientador_id === user.id)
}

export function getAlertsForUser(user: AuthUser | null): Alert[] {
  if (!user) return []
  if (user.role === 'coordenacao') return mockAlerts

  const scopedStudentIds = new Set(getStudentsForUser(user).map(student => student.id))
  return mockAlerts.filter(alert => {
    if (alert.student_id && scopedStudentIds.has(alert.student_id)) return true
    return alert.mentor_id === user.id
  })
}

export function getDashboardStatsForScope(students: Student[], alerts: Alert[]) {
  const studentIds = new Set(students.map(student => student.id))
  const meetings = mockMeetings.filter(meeting => studentIds.has(meeting.student_id))
  const mentorIds = new Set(students.map(student => student.mentor_id).filter(Boolean))
  const orientadorIds = new Set(students.map(student => student.orientador_id).filter(Boolean))
  const supervisorIds = new Set(students.map(student => student.supervisor_id).filter(Boolean))

  return {
    totalStudents: students.length,
    activeStudents: students.filter(student => student.status === 'ativo').length,
    inactiveStudents: students.filter(student => student.status === 'inativo').length,
    criticalStudents: students.filter(student => student.status === 'critico').length,
    totalMentors: mockProfiles.filter(profile => mentorIds.has(profile.id)).length,
    totalOrientadores: mockProfiles.filter(profile => orientadorIds.has(profile.id)).length,
    totalSupervisors: mockProfiles.filter(profile => supervisorIds.has(profile.id)).length,
    meetingsThisMonth: meetings.length,
    meetingsPending: meetings.filter(meeting => meeting.status === 'agendada').length,
    studentsWithoutFutureMeeting: students.filter(student => !student.next_meeting_at).length,
    studentsWithDelayedMeeting: students.filter(student => (student.days_since_last_meeting ?? 0) > 21).length,
    unreadAlerts: alerts.filter(alert => !alert.is_read && !alert.is_resolved).length,
  }
}

export function getDashboardCopy(role: UserRole) {
  if (role === 'supervisor') {
    return {
      title: 'Painel da Supervisão',
      description: 'Riscos, reuniões e alertas dos alunos sob sua supervisão',
    }
  }

  if (role === 'mentor') {
    return {
      title: 'Resumo do Mentor',
      description: 'Prioridades da sua carteira e próximos acompanhamentos',
    }
  }

  if (role === 'orientador') {
    return {
      title: 'Resumo do Orientador',
      description: 'Checklists, guias e pontos de estudo dos seus alunos',
    }
  }

  return {
    title: 'Dashboard Geral',
    description: 'Central de inteligência operacional da Mentoria Residência',
  }
}
