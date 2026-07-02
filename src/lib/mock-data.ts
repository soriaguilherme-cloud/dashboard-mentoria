import {
  Profile, Student, Meeting, MedicalRecord, Goal,
  WeeklyChecklist, PrepCourse, Alert, MonthlyReport, Topic, StudentTopic
} from '@/types/database'

export const mockPrepCourses: PrepCourse[] = [
  { id: 'pc1', name: 'Medcel', description: 'Plataforma Medcel', is_active: true, created_at: '2024-01-01' },
  { id: 'pc2', name: 'Medcof', description: 'Medcof Residência', is_active: true, created_at: '2024-01-01' },
  { id: 'pc3', name: 'Estratégia Med', description: 'Estratégia Med', is_active: true, created_at: '2024-01-01' },
  { id: 'pc4', name: 'Aristo', description: 'Aristo Medicina', is_active: true, created_at: '2024-01-01' },
  { id: 'pc5', name: 'Medway', description: 'Medway Residência', is_active: true, created_at: '2024-01-01' },
]

export const mockProfiles: Profile[] = [
  // Coordenação
  { id: 'u1', user_id: 'auth1', name: 'Dra. Ana Lima', email: 'ana.lima@afya.com.br', role: 'coordenacao', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Supervisores
  { id: 'u2', user_id: 'auth2', name: 'Dr. Carlos Menezes', email: 'carlos.menezes@afya.com.br', role: 'supervisor', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u3', user_id: 'auth3', name: 'Dra. Fernanda Souza', email: 'fernanda.souza@afya.com.br', role: 'supervisor', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Mentores
  { id: 'u4', user_id: 'auth4', name: 'Dr. Ricardo Oliveira', email: 'ricardo.oliveira@afya.com.br', role: 'mentor', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u5', user_id: 'auth5', name: 'Dra. Patrícia Costa', email: 'patricia.costa@afya.com.br', role: 'mentor', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u6', user_id: 'auth6', name: 'Dr. Thiago Martins', email: 'thiago.martins@afya.com.br', role: 'mentor', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  // Orientadores
  { id: 'u7', user_id: 'auth7', name: 'Profa. Juliana Ramos', email: 'juliana.ramos@afya.com.br', role: 'orientador', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u8', user_id: 'auth8', name: 'Prof. Eduardo Silva', email: 'eduardo.silva@afya.com.br', role: 'orientador', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
]

export const mockStudents: Student[] = [
  {
    id: 's1', name: 'João Paulo Ferreira', email: 'joao.ferreira@email.com', phone: '(11) 99999-0001',
    status: 'ativo', activity_level: 'alto', study_phase: 'construcao',
    target_exam: 'ENARE 2025', target_institution: 'USP', desired_specialty: 'Clínica Médica',
    prep_course_id: 'pc1', mentor_id: 'u4', orientador_id: 'u7', supervisor_id: 'u2',
    risk_score: 2, last_meeting_at: '2025-06-20', next_meeting_at: '2025-07-04',
    days_since_last_meeting: 10, enrolled_at: '2024-03-01', created_at: '2024-03-01', updated_at: '2025-06-20',
    mentor: mockProfiles[3], orientador: mockProfiles[6], supervisor: mockProfiles[1],
    prep_course: mockPrepCourses[0],
  },
  {
    id: 's2', name: 'Maria Clara Santos', email: 'maria.santos@email.com', phone: '(11) 99999-0002',
    status: 'ativo', activity_level: 'medio', study_phase: 'consolidacao',
    target_exam: 'ENARE 2025', target_institution: 'UNIFESP', desired_specialty: 'Pediatria',
    prep_course_id: 'pc2', mentor_id: 'u4', orientador_id: 'u7', supervisor_id: 'u2',
    risk_score: 4, last_meeting_at: '2025-06-18', next_meeting_at: '2025-07-02',
    days_since_last_meeting: 12, enrolled_at: '2024-02-01', created_at: '2024-02-01', updated_at: '2025-06-18',
    mentor: mockProfiles[3], orientador: mockProfiles[6], supervisor: mockProfiles[1],
    prep_course: mockPrepCourses[1],
  },
  {
    id: 's3', name: 'Pedro Henrique Lima', email: 'pedro.lima@email.com', phone: '(11) 99999-0003',
    status: 'critico', activity_level: 'baixo', study_phase: 'construcao',
    target_exam: 'SUS-SP 2025', target_institution: 'SANTA CASA', desired_specialty: 'Cirurgia Geral',
    prep_course_id: 'pc3', mentor_id: 'u4', orientador_id: 'u8', supervisor_id: 'u2',
    risk_score: 9, last_meeting_at: '2025-05-30', next_meeting_at: undefined,
    days_since_last_meeting: 31, enrolled_at: '2024-01-15', created_at: '2024-01-15', updated_at: '2025-05-30',
    mentor: mockProfiles[3], orientador: mockProfiles[7], supervisor: mockProfiles[1],
    prep_course: mockPrepCourses[2],
    alerts: [
      { id: 'a1', student_id: 's3', type: 'sem_reuniao_futura', severity: 'critical', title: 'Sem reunião futura marcada', is_read: false, is_resolved: false, created_at: '2025-06-25' },
      { id: 'a2', student_id: 's3', type: 'inatividade', severity: 'critical', title: 'Mais de 30 dias sem reunião', is_read: false, is_resolved: false, created_at: '2025-06-25' },
    ]
  },
  {
    id: 's4', name: 'Ana Beatriz Rodrigues', email: 'ana.rodrigues@email.com', phone: '(11) 99999-0004',
    status: 'ativo', activity_level: 'alto', study_phase: 'manutencao',
    target_exam: 'ENARE 2025', target_institution: 'USP', desired_specialty: 'Ginecologia',
    prep_course_id: 'pc1', mentor_id: 'u5', orientador_id: 'u7', supervisor_id: 'u2',
    risk_score: 1, last_meeting_at: '2025-06-24', next_meeting_at: '2025-07-08',
    days_since_last_meeting: 6, enrolled_at: '2024-04-01', created_at: '2024-04-01', updated_at: '2025-06-24',
    mentor: mockProfiles[4], orientador: mockProfiles[6], supervisor: mockProfiles[1],
    prep_course: mockPrepCourses[0],
  },
  {
    id: 's5', name: 'Lucas Mendes Costa', email: 'lucas.costa@email.com', phone: '(11) 99999-0005',
    status: 'inativo', activity_level: 'baixo', study_phase: 'construcao',
    target_exam: 'HCFMUSP 2025', target_institution: 'HCFMUSP', desired_specialty: 'Ortopedia',
    prep_course_id: 'pc4', mentor_id: 'u5', orientador_id: 'u8', supervisor_id: 'u3',
    risk_score: 7, last_meeting_at: '2025-06-05', next_meeting_at: '2025-07-01',
    days_since_last_meeting: 25, enrolled_at: '2024-03-15', created_at: '2024-03-15', updated_at: '2025-06-05',
    mentor: mockProfiles[4], orientador: mockProfiles[7], supervisor: mockProfiles[2],
    prep_course: mockPrepCourses[3],
  },
  {
    id: 's6', name: 'Camila Ferreira Neves', email: 'camila.neves@email.com',
    status: 'ativo', activity_level: 'medio', study_phase: 'consolidacao',
    target_exam: 'ENARE 2025', target_institution: 'UNIFESP', desired_specialty: 'Neurologia',
    prep_course_id: 'pc5', mentor_id: 'u6', orientador_id: 'u7', supervisor_id: 'u3',
    risk_score: 3, last_meeting_at: '2025-06-22', next_meeting_at: '2025-07-06',
    days_since_last_meeting: 8, enrolled_at: '2024-02-15', created_at: '2024-02-15', updated_at: '2025-06-22',
    mentor: mockProfiles[5], orientador: mockProfiles[6], supervisor: mockProfiles[2],
    prep_course: mockPrepCourses[4],
  },
  {
    id: 's7', name: 'Gabriel Alves Pereira', email: 'gabriel.pereira@email.com',
    status: 'critico', activity_level: 'baixo', study_phase: 'construcao',
    target_exam: 'SUS-SP 2025', target_institution: 'FMUSP', desired_specialty: 'Medicina de Família',
    prep_course_id: 'pc3', mentor_id: 'u6', orientador_id: 'u8', supervisor_id: 'u3',
    risk_score: 8, last_meeting_at: '2025-06-10', next_meeting_at: undefined,
    days_since_last_meeting: 20, enrolled_at: '2024-01-20', created_at: '2024-01-20', updated_at: '2025-06-10',
    mentor: mockProfiles[5], orientador: mockProfiles[7], supervisor: mockProfiles[2],
    prep_course: mockPrepCourses[2],
    alerts: [
      { id: 'a3', student_id: 's7', type: 'sem_reuniao_futura', severity: 'critical', title: 'Sem reunião futura marcada', is_read: false, is_resolved: false, created_at: '2025-06-25' },
    ]
  },
  {
    id: 's8', name: 'Isabela Sousa Gomes', email: 'isabela.gomes@email.com',
    status: 'ativo', activity_level: 'alto', study_phase: 'manutencao',
    target_exam: 'ENARE 2025', target_institution: 'UNICAMP', desired_specialty: 'Psiquiatria',
    prep_course_id: 'pc1', mentor_id: 'u5', orientador_id: 'u7', supervisor_id: 'u2',
    risk_score: 2, last_meeting_at: '2025-06-23', next_meeting_at: '2025-07-07',
    days_since_last_meeting: 7, enrolled_at: '2024-05-01', created_at: '2024-05-01', updated_at: '2025-06-23',
    mentor: mockProfiles[4], orientador: mockProfiles[6], supervisor: mockProfiles[1],
    prep_course: mockPrepCourses[0],
  },
]

export const mockMeetings: Meeting[] = [
  {
    id: 'm1', student_id: 's1', mentor_id: 'u4',
    title: 'Reunião de acompanhamento - João Paulo',
    status: 'realizada', scheduled_at: '2025-06-20T10:00:00',
    duration_minutes: 60, created_at: '2025-06-15', updated_at: '2025-06-20',
    student: mockStudents[0], mentor: mockProfiles[3],
  },
  {
    id: 'm2', student_id: 's1', mentor_id: 'u4',
    title: 'Próxima reunião - João Paulo',
    status: 'agendada', scheduled_at: '2025-07-04T10:00:00',
    duration_minutes: 60, created_at: '2025-06-20', updated_at: '2025-06-20',
    student: mockStudents[0], mentor: mockProfiles[3],
  },
  {
    id: 'm3', student_id: 's2', mentor_id: 'u4',
    title: 'Reunião de acompanhamento - Maria Clara',
    status: 'realizada', scheduled_at: '2025-06-18T14:00:00',
    duration_minutes: 45, created_at: '2025-06-12', updated_at: '2025-06-18',
    student: mockStudents[1], mentor: mockProfiles[3],
  },
  {
    id: 'm4', student_id: 's4', mentor_id: 'u5',
    title: 'Reunião de acompanhamento - Ana Beatriz',
    status: 'realizada', scheduled_at: '2025-06-24T09:00:00',
    duration_minutes: 60, created_at: '2025-06-20', updated_at: '2025-06-24',
    student: mockStudents[3], mentor: mockProfiles[4],
  },
  {
    id: 'm5', student_id: 's3', mentor_id: 'u4',
    title: 'Reunião - Pedro Henrique (última)',
    status: 'realizada', scheduled_at: '2025-05-30T11:00:00',
    duration_minutes: 30, created_at: '2025-05-25', updated_at: '2025-05-30',
    student: mockStudents[2], mentor: mockProfiles[3],
  },
]

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'mr1', meeting_id: 'm1', student_id: 's1', mentor_id: 'u4',
    record_date: '2025-06-20',
    meeting_summary: 'João Paulo está em bom ritmo. Concluiu os módulos de Clínica Médica do Medcel e iniciou os simulados semanais.',
    current_context: 'Fase de construção com foco em Clínica Médica. Fazendo o cursinho Medcel e simulados semanais.',
    main_difficulties: 'Dificuldade em Nefrologia e Cardiologia. Tempo de estudo reduzido por trabalho noturno.',
    main_advances: 'Melhorou significativamente em Pneumologia. Checklist sendo preenchido semanalmente.',
    goals: '1. Concluir módulo de Cardiologia até 30/06\n2. Fazer 2 simulados por semana\n3. Revisar Pneumologia',
    next_steps: '1. Agendar simulado diagnóstico na próxima semana\n2. Revisar Nefrologia com foco em hipertensão',
    attention_points: 'Trabalho noturno prejudicando o estudo. Avaliar redistribuição de horários.',
    priority_topics: 'Cardiologia, Nefrologia, Endocrinologia',
    what_worked: 'Método de leitura ativa. Revisão espaçada no Anki.',
    what_didnt_work: 'Estudo em blocos longos. Tentativa de estudar após plantão noturno.',
    weekly_checklist: 'Simulado: ✅ | Revisão Pneumologia: ✅ | Módulo Cardio: 50% | Anki: ✅',
    next_meeting_referrals: 'Cobrar: simulado diagnóstico, evolução em Cardiologia, ajuste de horário.',
    mentor_observations: 'Aluno comprometido. Ponto crítico é gestão do tempo com o trabalho.',
    ai_generated: false, is_approved: true, created_at: '2025-06-20', updated_at: '2025-06-20',
    student: mockStudents[0], mentor: mockProfiles[3],
  },
]

export const mockGoals: Goal[] = [
  { id: 'g1', student_id: 's1', title: 'Concluir módulo Cardiologia', description: 'Medcel - módulo completo', due_date: '2025-06-30', is_completed: false, created_by: 'u4', created_at: '2025-06-20', updated_at: '2025-06-20' },
  { id: 'g2', student_id: 's1', title: 'Fazer 2 simulados por semana', description: 'Simular questões do ENARE', is_completed: false, created_by: 'u4', created_at: '2025-06-20', updated_at: '2025-06-20' },
  { id: 'g3', student_id: 's2', title: 'Revisar Pediatria geral', description: 'Foco em infecções pediátricas', due_date: '2025-07-15', is_completed: false, created_by: 'u4', created_at: '2025-06-18', updated_at: '2025-06-18' },
  { id: 'g4', student_id: 's4', title: 'Simulado ENARE completo', description: 'Prova diagnóstica completa', due_date: '2025-07-01', is_completed: true, completed_at: '2025-06-22', created_by: 'u5', created_at: '2025-06-10', updated_at: '2025-06-22' },
]

export const mockWeeklyChecklists: WeeklyChecklist[] = [
  {
    id: 'wc1', student_id: 's1', week_start: '2025-06-23', week_end: '2025-06-29',
    status: 'em_andamento',
    weekly_goals: 'Concluir Cardiologia, 2 simulados, revisão Pneumologia',
    planned_topics: 'Cardiologia, Pneumologia',
    completed_topics: 'Pneumologia',
    simulations_done: 1, revisions_done: 2,
    pending_items: 'Simulado 2, Módulo Cardiologia completo',
    study_hours: 18,
    created_at: '2025-06-23', updated_at: '2025-06-26',
    student: mockStudents[0],
  },
]

export const mockAlerts: Alert[] = [
  { id: 'a1', student_id: 's3', type: 'sem_reuniao_futura', severity: 'critical', title: 'Sem reunião futura marcada', description: 'Pedro Henrique Lima não possui reunião futura agendada.', is_read: false, is_resolved: false, created_at: '2025-06-25' },
  { id: 'a2', student_id: 's3', type: 'inatividade', severity: 'critical', title: 'Mais de 30 dias sem reunião', description: 'Pedro Henrique Lima está há 31 dias sem reunião.', is_read: false, is_resolved: false, created_at: '2025-06-25' },
  { id: 'a3', student_id: 's7', type: 'sem_reuniao_futura', severity: 'critical', title: 'Sem reunião futura marcada', description: 'Gabriel Alves Pereira não possui reunião futura agendada.', is_read: false, is_resolved: false, created_at: '2025-06-25' },
  { id: 'a4', student_id: 's5', type: 'inatividade', severity: 'warning', title: 'Aluno inativo há 25 dias', description: 'Lucas Mendes Costa está há 25 dias sem atividade registrada.', is_read: false, is_resolved: false, created_at: '2025-06-25' },
  { id: 'a5', mentor_id: 'u6', type: 'prontuario_pendente', severity: 'warning', title: 'Prontuário pós-reunião pendente', description: 'Dr. Thiago Martins possui reunião sem prontuário preenchido.', is_read: false, is_resolved: false, created_at: '2025-06-25' },
]

export const mockTopics: Topic[] = [
  { id: 't1', name: 'Hipertensão Arterial', area: 'Clínica Médica', sub_area: 'Cardiologia', incidence_score: 9, importance: 'alta', created_at: '2024-01-01' },
  { id: 't2', name: 'Insuficiência Cardíaca', area: 'Clínica Médica', sub_area: 'Cardiologia', incidence_score: 8, importance: 'alta', created_at: '2024-01-01' },
  { id: 't3', name: 'DPOC e Asma', area: 'Clínica Médica', sub_area: 'Pneumologia', incidence_score: 8, importance: 'alta', created_at: '2024-01-01' },
  { id: 't4', name: 'Diabetes Mellitus', area: 'Clínica Médica', sub_area: 'Endocrinologia', incidence_score: 9, importance: 'alta', created_at: '2024-01-01' },
  { id: 't5', name: 'Insuficiência Renal Crônica', area: 'Clínica Médica', sub_area: 'Nefrologia', incidence_score: 7, importance: 'alta', created_at: '2024-01-01' },
  { id: 't6', name: 'Infecções em Pediatria', area: 'Pediatria', sub_area: 'Infectologia Pediátrica', incidence_score: 8, importance: 'alta', created_at: '2024-01-01' },
  { id: 't7', name: 'Urgências em Obstetrícia', area: 'Ginecologia e Obstetrícia', sub_area: 'Obstetrícia', incidence_score: 7, importance: 'alta', created_at: '2024-01-01' },
  { id: 't8', name: 'Trauma e Urgência Cirúrgica', area: 'Cirurgia Geral', sub_area: 'Urgência e Emergência', incidence_score: 6, importance: 'media', created_at: '2024-01-01' },
]

export const mockStudentTopics: StudentTopic[] = [
  { id: 'st1', student_id: 's1', topic_id: 't1', status: 'visto', phase: 'consolidacao', performance_score: 75, last_studied_at: '2025-06-15', created_at: '2025-03-01', updated_at: '2025-06-15', topic: mockTopics[0] },
  { id: 'st2', student_id: 's1', topic_id: 't2', status: 'pendente', phase: 'construcao', created_at: '2025-03-01', updated_at: '2025-03-01', topic: mockTopics[1] },
  { id: 'st3', student_id: 's1', topic_id: 't3', status: 'visto', phase: 'manutencao', performance_score: 85, last_studied_at: '2025-06-18', created_at: '2025-03-01', updated_at: '2025-06-18', topic: mockTopics[2] },
  { id: 'st4', student_id: 's1', topic_id: 't4', status: 'pendente', phase: 'construcao', created_at: '2025-03-01', updated_at: '2025-03-01', topic: mockTopics[3] },
  { id: 'st5', student_id: 's1', topic_id: 't5', status: 'pendente', phase: 'construcao', created_at: '2025-03-01', updated_at: '2025-03-01', topic: mockTopics[4] },
]

export const mockMonthlyReports: MonthlyReport[] = [
  { id: 'rep1', student_id: 's1', month: 4, year: 2025, study_hours: 80, accuracy_percentage: 68, simulations_count: 4, topics_completed: 8, topics_pending: 12, perceived_evolution: 'Boa evolução em Pneumologia e Gastrologia', attention_points: 'Cardiologia ainda fraca', mentor_observations: 'Mantendo ritmo, mas precisa acelerar Cardiologia', created_by: 'u4', created_at: '2025-05-01', updated_at: '2025-05-01' },
  { id: 'rep2', student_id: 's1', month: 5, year: 2025, study_hours: 92, accuracy_percentage: 72, simulations_count: 6, topics_completed: 12, topics_pending: 8, perceived_evolution: 'Evolução consistente, melhora em Nefrologia', attention_points: 'Cardiologia estável, Endocrinologia pendente', mentor_observations: 'Excelente comprometimento. Avaliar aceleração em Endocrinologia.', created_by: 'u4', created_at: '2025-06-01', updated_at: '2025-06-01' },
]

// Dashboard aggregated stats
export const mockDashboardStats = {
  totalStudents: mockStudents.length,
  activeStudents: mockStudents.filter(s => s.status === 'ativo').length,
  inactiveStudents: mockStudents.filter(s => s.status === 'inativo').length,
  criticalStudents: mockStudents.filter(s => s.status === 'critico').length,
  totalMentors: mockProfiles.filter(p => p.role === 'mentor').length,
  totalOrientadores: mockProfiles.filter(p => p.role === 'orientador').length,
  totalSupervisors: mockProfiles.filter(p => p.role === 'supervisor').length,
  meetingsThisMonth: 18,
  meetingsPending: 5,
  studentsWithoutFutureMeeting: mockStudents.filter(s => !s.next_meeting_at).length,
  studentsWithDelayedMeeting: mockStudents.filter(s => (s.days_since_last_meeting ?? 0) > 21).length,
  unreadAlerts: mockAlerts.filter(a => !a.is_read).length,
}
