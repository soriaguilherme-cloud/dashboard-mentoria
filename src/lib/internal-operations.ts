import {
  mockAlerts,
  mockMedicalRecords,
  mockMeetings,
  mockMonthlyReports,
  mockStudents,
  mockWeeklyChecklists,
} from '@/lib/mock-data'
import {
  getRecommendedAction,
  getRiskExplanation,
} from '@/lib/operational-intelligence'
import { Student } from '@/types/database'

export type GuideStatus = 'rascunho' | 'revisado' | 'enviado'

export type InternalGuideTemplate = {
  id: string
  title: string
  context: string
  description: string
  audience: 'mentor' | 'orientador' | 'supervisor'
  sections: string[]
  recommendedFor: string
}

export type StudentDocument = {
  id: string
  studentId: string
  title: string
  type: 'guia_pos_reuniao' | 'plano_semanal' | 'pos_simulado' | 'reta_final'
  status: GuideStatus
  meetingId?: string
  createdAt: string
  reviewedBy?: string
  sentAt?: string
  internalNote: string
}

export type CommunicationLog = {
  id: string
  studentId: string
  channel: 'WhatsApp' | 'E-mail' | 'Reunião' | 'Interno'
  title: string
  summary: string
  owner: string
  createdAt: string
}

export type OperationalChecklistItem = {
  id: string
  label: string
  done: boolean
  owner: string
  actionHref?: string
}

export type KanbanStage = {
  id: string
  title: string
  description: string
  tone: 'slate' | 'blue' | 'yellow' | 'red' | 'emerald'
  students: Student[]
}

export type OperationQualityMetric = {
  label: string
  value: number
  suffix?: string
  detail: string
  tone: KanbanStage['tone']
}

export const internalGuideTemplates: InternalGuideTemplate[] = [
  {
    id: 'primeira-reuniao',
    title: 'Primeira reunião',
    context: 'Onboarding do aluno',
    description: 'Organiza equipe, combinados, rotina inicial e como o aluno deve executar a primeira semana.',
    audience: 'mentor',
    sections: ['Contexto do aluno', 'Time da mentoria', 'Plano da semana', 'Combinados', 'Próxima reunião'],
    recommendedFor: 'Aluno recém-chegado ou sem histórico consolidado.',
  },
  {
    id: 'ajuste-rota',
    title: 'Ajuste de rota',
    context: 'Aluno oscilando',
    description: 'Traduz dificuldades em plano objetivo, com uma próxima ação clara e acompanhamento mais curto.',
    audience: 'mentor',
    sections: ['O que mudou', 'Barreiras atuais', 'Plano revisado', 'Metas mínimas', 'Sinalizadores'],
    recommendedFor: 'Risco moderado, baixa aderência ou troca de objetivo.',
  },
  {
    id: 'pos-simulado',
    title: 'Pós-simulado',
    context: 'Análise de performance',
    description: 'Converte resultado de simulado em temas prioritários, revisão e estratégia de prova.',
    audience: 'orientador',
    sections: ['Resultado geral', 'Áreas fracas', 'Erros recorrentes', 'Revisão espaçada', 'Próximo simulado'],
    recommendedFor: 'Aluno com simulado recente ou queda de acurácia.',
  },
  {
    id: 'baixa-performance',
    title: 'Baixa performance',
    context: 'Intervenção estruturada',
    description: 'Alinha mentor, supervisor e orientador em um plano de retomada com ações verificáveis.',
    audience: 'supervisor',
    sections: ['Diagnóstico', 'Hipótese de causa', 'Intervenção', 'Responsáveis', 'Prazo de reavaliação'],
    recommendedFor: 'Aluno crítico, sem reunião futura ou com risco acima de 7.',
  },
  {
    id: 'reta-final',
    title: 'Reta final',
    context: 'Últimas semanas antes da prova',
    description: 'Prioriza revisão, simulados, descanso estratégico e decisões de prova.',
    audience: 'mentor',
    sections: ['Prova-alvo', 'Temas quentes', 'Revisão final', 'Simulados restantes', 'Rotina pré-prova'],
    recommendedFor: 'Aluno próximo da prova ou em fase de manutenção.',
  },
]

const baseDocuments: StudentDocument[] = [
  {
    id: 'doc-s1-m1',
    studentId: 's1',
    meetingId: 'm1',
    title: 'Guia de Estudos - Reunião 01',
    type: 'guia_pos_reuniao',
    status: 'enviado',
    createdAt: '2025-06-20',
    reviewedBy: 'Dr. Ricardo Oliveira',
    sentAt: '2025-06-20',
    internalNote: 'Enviado por WhatsApp após validação do mentor. Manter cobrança de Cardiologia.',
  },
  {
    id: 'doc-s2-m3',
    studentId: 's2',
    meetingId: 'm3',
    title: 'Guia de Estudos - Ajuste de rotina',
    type: 'guia_pos_reuniao',
    status: 'revisado',
    createdAt: '2025-06-18',
    reviewedBy: 'Dr. Ricardo Oliveira',
    internalNote: 'Revisado. Falta registrar envio e combinar data da próxima devolutiva.',
  },
  {
    id: 'doc-s3-m5',
    studentId: 's3',
    meetingId: 'm5',
    title: 'Plano de retomada - aluno crítico',
    type: 'guia_pos_reuniao',
    status: 'rascunho',
    createdAt: '2025-05-30',
    internalNote: 'Rascunho gerado a partir do último prontuário. Supervisor precisa revisar antes do envio.',
  },
  {
    id: 'doc-s4-pos-simulado',
    studentId: 's4',
    title: 'Análise pós-simulado ENARE',
    type: 'pos_simulado',
    status: 'enviado',
    createdAt: '2025-06-24',
    reviewedBy: 'Dra. Patrícia Costa',
    sentAt: '2025-06-25',
    internalNote: 'Boa evolução. Próximo ciclo deve manter Ginecologia e revisar Obstetrícia.',
  },
]

const baseCommunications: CommunicationLog[] = [
  {
    id: 'com-s1-1',
    studentId: 's1',
    channel: 'WhatsApp',
    title: 'Guia pós-reunião enviado',
    summary: 'PDF enviado com combinados da primeira reunião e plano semanal.',
    owner: 'Dr. Ricardo Oliveira',
    createdAt: '2025-06-20T18:10:00',
  },
  {
    id: 'com-s1-2',
    studentId: 's1',
    channel: 'Reunião',
    title: 'Próxima reunião marcada',
    summary: 'Acompanhamento agendado para revisar simulado diagnóstico e Cardiologia.',
    owner: 'Dr. Ricardo Oliveira',
    createdAt: '2025-06-20T18:20:00',
  },
  {
    id: 'com-s2-1',
    studentId: 's2',
    channel: 'Interno',
    title: 'Guia revisado, envio pendente',
    summary: 'Documento revisado pelo mentor, mas ainda sem confirmação de envio ao aluno.',
    owner: 'Dr. Ricardo Oliveira',
    createdAt: '2025-06-19T09:00:00',
  },
  {
    id: 'com-s3-1',
    studentId: 's3',
    channel: 'Interno',
    title: 'Escalado para supervisão',
    summary: 'Aluno sem reunião futura e com risco elevado. Prioridade para retomada.',
    owner: 'Dr. Carlos Menezes',
    createdAt: '2025-06-25T11:30:00',
  },
]

export function getStudentDocuments(studentId: string) {
  const generatedFromMeetings = mockMeetings
    .filter(meeting => meeting.student_id === studentId && meeting.status === 'realizada')
    .map((meeting, index): StudentDocument => {
      const existing = baseDocuments.find(document => document.meetingId === meeting.id)
      if (existing) return existing

      const record = mockMedicalRecords.find(item => item.meeting_id === meeting.id)
      return {
        id: `doc-${meeting.id}`,
        studentId,
        meetingId: meeting.id,
        title: `Guia de Estudos - Reunião ${String(index + 1).padStart(2, '0')}`,
        type: 'guia_pos_reuniao',
        status: record?.is_approved ? 'revisado' : 'rascunho',
        createdAt: meeting.updated_at,
        reviewedBy: record?.is_approved ? meeting.mentor?.name : undefined,
        internalNote: record
          ? 'Gerado a partir do prontuário. Conferir observações internas antes do envio.'
          : 'Aguardando prontuário para completar o documento.',
      }
    })

  const manualDocuments = baseDocuments.filter(document =>
    document.studentId === studentId && !document.meetingId
  )

  return [...generatedFromMeetings, ...manualDocuments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getCommunicationHistory(studentId: string) {
  return baseCommunications
    .filter(item => item.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getOperationalChecklist(student: Student): OperationalChecklistItem[] {
  const documents = getStudentDocuments(student.id)
  const meetings = mockMeetings.filter(meeting => meeting.student_id === student.id)
  const records = mockMedicalRecords.filter(record => record.student_id === student.id)
  const latestDocument = documents[0]

  return [
    {
      id: 'meeting-done',
      label: 'Última reunião registrada',
      done: meetings.some(meeting => meeting.status === 'realizada'),
      owner: 'Mentor',
      actionHref: `/reunioes/nova?aluno=${student.id}`,
    },
    {
      id: 'record-done',
      label: 'Prontuário pós-reunião preenchido',
      done: records.length > 0,
      owner: 'Mentor',
      actionHref: '/prontuarios',
    },
    {
      id: 'guide-created',
      label: 'Guia pós-reunião gerado',
      done: documents.length > 0,
      owner: 'Mentor',
      actionHref: meetings[0] ? `/reunioes/${meetings[0].id}/relatorio-aluno` : undefined,
    },
    {
      id: 'guide-sent',
      label: 'Documento enviado ao aluno',
      done: latestDocument?.status === 'enviado',
      owner: 'Mentor',
      actionHref: latestDocument?.meetingId ? `/reunioes/${latestDocument.meetingId}/relatorio-aluno` : undefined,
    },
    {
      id: 'next-action',
      label: 'Próxima ação definida',
      done: Boolean(getRecommendedAction(student)),
      owner: student.status === 'critico' ? 'Supervisor' : 'Mentor',
      actionHref: `/alunos/${student.id}`,
    },
    {
      id: 'next-meeting',
      label: 'Próxima reunião marcada',
      done: Boolean(student.next_meeting_at),
      owner: 'Mentor',
      actionHref: `/reunioes/nova?aluno=${student.id}`,
    },
  ]
}

export function getInternalStudentSummary(student: Student) {
  const checklist = getOperationalChecklist(student)
  const documents = getStudentDocuments(student.id)
  const communications = getCommunicationHistory(student.id)
  const completion = Math.round((checklist.filter(item => item.done).length / checklist.length) * 100)

  return {
    riskReason: getRiskExplanation(student),
    recommendedAction: getRecommendedAction(student),
    completion,
    latestDocument: documents[0],
    latestCommunication: communications[0],
    internalNote: student.status === 'critico'
      ? 'Acompanhamento deve envolver supervisor antes do próximo envio ao aluno.'
      : 'Manter registro interno de cada orientação enviada por WhatsApp ou e-mail.',
  }
}

export function getKanbanStages(students: Student[]): KanbanStage[] {
  const documentsByStudent = new Map(students.map(student => [student.id, getStudentDocuments(student.id)]))
  const studentIds = new Set(students.map(student => student.id))
  const studentsWithRealizedMeeting = new Set(
    mockMeetings
      .filter(meeting => studentIds.has(meeting.student_id) && meeting.status === 'realizada')
      .map(meeting => meeting.student_id)
  )
  const studentsWithRecord = new Set(
    mockMedicalRecords
      .filter(record => studentIds.has(record.student_id))
      .map(record => record.student_id)
  )

  return [
    {
      id: 'needs-meeting',
      title: 'Precisa de reunião',
      description: 'Sem reunião futura ou atraso de acompanhamento.',
      tone: 'red',
      students: students.filter(student => !student.next_meeting_at || (student.days_since_last_meeting ?? 0) > 21),
    },
    {
      id: 'scheduled',
      title: 'Reunião agendada',
      description: 'Tem encontro futuro e aguarda execução.',
      tone: 'blue',
      students: students.filter(student => Boolean(student.next_meeting_at)),
    },
    {
      id: 'record-pending',
      title: 'Prontuário pendente',
      description: 'Reunião feita, mas sem registro longitudinal.',
      tone: 'yellow',
      students: students.filter(student => studentsWithRealizedMeeting.has(student.id) && !studentsWithRecord.has(student.id)),
    },
    {
      id: 'document-pending',
      title: 'Guia para revisar/enviar',
      description: 'Documento em rascunho ou revisado, ainda não enviado.',
      tone: 'yellow',
      students: students.filter(student => {
        const docs = documentsByStudent.get(student.id) ?? []
        return docs.some(document => document.status !== 'enviado')
      }),
    },
    {
      id: 'normal',
      title: 'Acompanhamento normal',
      description: 'Sem alerta crítico e com fluxo em dia.',
      tone: 'emerald',
      students: students.filter(student => student.status !== 'critico' && student.next_meeting_at && student.risk_score < 7),
    },
  ]
}

export function getOperationQualityMetrics(students: Student[]): OperationQualityMetric[] {
  const studentIds = new Set(students.map(student => student.id))
  const documents = students.flatMap(student => getStudentDocuments(student.id))
  const activeAlerts = mockAlerts.filter(alert =>
    !alert.is_resolved && (!alert.student_id || studentIds.has(alert.student_id))
  )
  const meetings = mockMeetings.filter(meeting => studentIds.has(meeting.student_id))
  const realizedMeetings = meetings.filter(meeting => meeting.status === 'realizada')
  const records = mockMedicalRecords.filter(record => studentIds.has(record.student_id))
  const checklists = mockWeeklyChecklists.filter(checklist => studentIds.has(checklist.student_id))
  const reports = mockMonthlyReports.filter(report => studentIds.has(report.student_id))

  return [
    {
      label: 'Alunos sem reunião futura',
      value: students.filter(student => !student.next_meeting_at).length,
      detail: 'Prioridade de agendamento',
      tone: 'red',
    },
    {
      label: 'Guias pendentes de envio',
      value: documents.filter(document => document.status !== 'enviado').length,
      detail: 'Rascunho ou revisado',
      tone: 'yellow',
    },
    {
      label: 'Cobertura de prontuário',
      value: realizedMeetings.length === 0 ? 100 : Math.round((records.length / realizedMeetings.length) * 100),
      suffix: '%',
      detail: 'Reuniões realizadas com registro',
      tone: 'emerald',
    },
    {
      label: 'Alertas ativos',
      value: activeAlerts.length,
      detail: 'Ainda sem resolução',
      tone: activeAlerts.some(alert => alert.severity === 'critical') ? 'red' : 'yellow',
    },
    {
      label: 'Checklists em andamento',
      value: checklists.filter(checklist => checklist.status !== 'concluido').length,
      detail: 'Demandam cobrança interna',
      tone: 'blue',
    },
    {
      label: 'Relatórios mensais',
      value: reports.length,
      detail: 'Base para análise executiva',
      tone: 'slate',
    },
  ]
}

export function getDocumentsByStatus(students = mockStudents) {
  const documents = students.flatMap(student => getStudentDocuments(student.id))
  return {
    rascunho: documents.filter(document => document.status === 'rascunho').length,
    revisado: documents.filter(document => document.status === 'revisado').length,
    enviado: documents.filter(document => document.status === 'enviado').length,
  }
}
