export type UserRole = 'mentor' | 'orientador' | 'supervisor' | 'coordenacao'
export type StudentStatus = 'ativo' | 'inativo' | 'critico'
export type ActivityLevel = 'alto' | 'medio' | 'baixo'
export type StudyPhase = 'construcao' | 'consolidacao' | 'manutencao'
export type MeetingStatus = 'agendada' | 'realizada' | 'cancelada'
export type TopicStatus = 'visto' | 'pendente' | 'em_revisao'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type ChecklistStatus = 'pendente' | 'em_andamento' | 'concluido'

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  name: string
  email?: string
  phone?: string
  status: StudentStatus
  activity_level: ActivityLevel
  study_phase: StudyPhase
  target_exam?: string
  target_institution?: string
  desired_specialty?: string
  prep_course_id?: string
  mentor_id?: string
  orientador_id?: string
  supervisor_id?: string
  risk_score: number
  last_meeting_at?: string
  next_meeting_at?: string
  days_since_last_meeting?: number
  enrolled_at: string
  created_at: string
  updated_at: string
  // relations
  mentor?: Profile
  orientador?: Profile
  supervisor?: Profile
  prep_course?: PrepCourse
  alerts?: Alert[]
}

export interface Meeting {
  id: string
  student_id: string
  mentor_id: string
  title: string
  status: MeetingStatus
  scheduled_at: string
  duration_minutes?: number
  calendly_event_id?: string
  calendly_event_url?: string
  recording_url?: string
  transcript_url?: string
  created_at: string
  updated_at: string
  // relations
  student?: Student
  mentor?: Profile
  medical_record?: MedicalRecord
}

export interface MedicalRecord {
  id: string
  meeting_id?: string
  student_id: string
  mentor_id: string
  record_date: string
  meeting_summary?: string
  current_context?: string
  main_difficulties?: string
  main_advances?: string
  goals?: string
  next_steps?: string
  attention_points?: string
  priority_topics?: string
  exams_and_simulations?: string
  what_worked?: string
  what_didnt_work?: string
  weekly_checklist?: string
  next_meeting_referrals?: string
  mentor_observations?: string
  ai_generated: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  // relations
  student?: Student
  mentor?: Profile
  meeting?: Meeting
}

export interface Goal {
  id: string
  student_id: string
  title: string
  description?: string
  due_date?: string
  is_completed: boolean
  completed_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface WeeklyChecklist {
  id: string
  student_id: string
  week_start: string
  week_end: string
  status: ChecklistStatus
  weekly_goals?: string
  planned_topics?: string
  completed_topics?: string
  simulations_done?: number
  revisions_done?: number
  pending_items?: string
  difficulties?: string
  observations?: string
  study_hours?: number
  created_at: string
  updated_at: string
  // relations
  student?: Student
}

export interface PrepCourse {
  id: string
  name: string
  description?: string
  website?: string
  is_active: boolean
  created_at: string
}

export interface Topic {
  id: string
  name: string
  area: string
  sub_area?: string
  incidence_score: number
  importance: 'alta' | 'media' | 'baixa'
  created_at: string
}

export interface StudentTopic {
  id: string
  student_id: string
  topic_id: string
  status: TopicStatus
  phase: StudyPhase
  performance_score?: number
  last_studied_at?: string
  notes?: string
  created_at: string
  updated_at: string
  // relations
  topic?: Topic
  student?: Student
}

export interface MonthlyReport {
  id: string
  student_id: string
  month: number
  year: number
  study_hours?: number
  accuracy_percentage?: number
  simulations_count?: number
  topics_completed?: number
  topics_pending?: number
  perceived_evolution?: string
  attention_points?: string
  mentor_observations?: string
  file_url?: string
  file_type?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface StudyGuide {
  id: string
  student_id: string
  title: string
  content?: string
  next_steps?: string
  priority_topics?: string
  weekly_goals?: string
  revision_schedule?: string
  planned_simulations?: string
  planned_exams?: string
  weekly_checklist?: string
  mentor_guidelines?: string
  orientador_guidelines?: string
  ai_generated: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Workshop {
  id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes?: number
  responsible_id?: string
  location?: string
  is_online: boolean
  meeting_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  student_id?: string
  mentor_id?: string
  type: string
  severity: AlertSeverity
  title: string
  description?: string
  is_read: boolean
  is_resolved: boolean
  created_at: string
}

export interface CalendlyEvent {
  id: string
  student_id?: string
  event_id: string
  event_url?: string
  event_type?: string
  event_name?: string
  scheduled_at: string
  status: string
  raw_payload?: Record<string, unknown>
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> }
      students: { Row: Student; Insert: Omit<Student, 'created_at' | 'updated_at'>; Update: Partial<Student> }
      meetings: { Row: Meeting; Insert: Omit<Meeting, 'created_at' | 'updated_at'>; Update: Partial<Meeting> }
      medical_records: { Row: MedicalRecord; Insert: Omit<MedicalRecord, 'created_at' | 'updated_at'>; Update: Partial<MedicalRecord> }
      goals: { Row: Goal; Insert: Omit<Goal, 'created_at' | 'updated_at'>; Update: Partial<Goal> }
      weekly_checklists: { Row: WeeklyChecklist; Insert: Omit<WeeklyChecklist, 'created_at' | 'updated_at'>; Update: Partial<WeeklyChecklist> }
      prep_courses: { Row: PrepCourse; Insert: Omit<PrepCourse, 'created_at'>; Update: Partial<PrepCourse> }
      topics: { Row: Topic; Insert: Omit<Topic, 'created_at'>; Update: Partial<Topic> }
      student_topics: { Row: StudentTopic; Insert: Omit<StudentTopic, 'created_at' | 'updated_at'>; Update: Partial<StudentTopic> }
      monthly_reports: { Row: MonthlyReport; Insert: Omit<MonthlyReport, 'created_at' | 'updated_at'>; Update: Partial<MonthlyReport> }
      study_guides: { Row: StudyGuide; Insert: Omit<StudyGuide, 'created_at' | 'updated_at'>; Update: Partial<StudyGuide> }
      workshops: { Row: Workshop; Insert: Omit<Workshop, 'created_at' | 'updated_at'>; Update: Partial<Workshop> }
      alerts: { Row: Alert; Insert: Omit<Alert, 'created_at'>; Update: Partial<Alert> }
      calendly_events: { Row: CalendlyEvent; Insert: Omit<CalendlyEvent, 'created_at'>; Update: Partial<CalendlyEvent> }
    }
  }
}
