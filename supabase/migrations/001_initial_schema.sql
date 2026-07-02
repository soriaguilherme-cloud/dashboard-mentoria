-- ============================================================
-- Mentoria Residência Afya — Schema inicial
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================
CREATE TYPE user_role AS ENUM ('mentor', 'orientador', 'supervisor', 'coordenacao');
CREATE TYPE student_status AS ENUM ('ativo', 'inativo', 'critico');
CREATE TYPE activity_level AS ENUM ('alto', 'medio', 'baixo');
CREATE TYPE study_phase AS ENUM ('construcao', 'consolidacao', 'manutencao');
CREATE TYPE meeting_status AS ENUM ('agendada', 'realizada', 'cancelada');
CREATE TYPE topic_status AS ENUM ('visto', 'pendente', 'em_revisao');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE checklist_status AS ENUM ('pendente', 'em_andamento', 'concluido');
CREATE TYPE importance_level AS ENUM ('alta', 'media', 'baixa');

-- ============================================================
-- PROFILES (usuários internos)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CURSINHOS PREPARATÓRIOS
-- ============================================================
CREATE TABLE prep_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALUNOS
-- ============================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status student_status NOT NULL DEFAULT 'ativo',
  activity_level activity_level NOT NULL DEFAULT 'medio',
  study_phase study_phase NOT NULL DEFAULT 'construcao',
  target_exam TEXT,
  target_institution TEXT,
  desired_specialty TEXT,
  prep_course_id UUID REFERENCES prep_courses(id),
  mentor_id UUID REFERENCES profiles(id),
  orientador_id UUID REFERENCES profiles(id),
  supervisor_id UUID REFERENCES profiles(id),
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 10),
  last_meeting_at TIMESTAMPTZ,
  next_meeting_at TIMESTAMPTZ,
  enrolled_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REUNIÕES
-- ============================================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  status meeting_status NOT NULL DEFAULT 'agendada',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  calendly_event_id TEXT,
  calendly_event_url TEXT,
  recording_url TEXT,
  transcript_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRONTUÁRIOS (Medical Records)
-- ============================================================
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id),
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meeting_summary TEXT,
  current_context TEXT,
  main_difficulties TEXT,
  main_advances TEXT,
  goals TEXT,
  next_steps TEXT,
  attention_points TEXT,
  priority_topics TEXT,
  exams_and_simulations TEXT,
  what_worked TEXT,
  what_didnt_work TEXT,
  weekly_checklist TEXT,
  next_meeting_referrals TEXT,
  mentor_observations TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- METAS
-- ============================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHECKLISTS SEMANAIS
-- ============================================================
CREATE TABLE weekly_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status checklist_status NOT NULL DEFAULT 'pendente',
  weekly_goals TEXT,
  planned_topics TEXT,
  completed_topics TEXT,
  simulations_done INTEGER DEFAULT 0,
  revisions_done INTEGER DEFAULT 0,
  pending_items TEXT,
  difficulties TEXT,
  observations TEXT,
  study_hours NUMERIC(5,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEMAS
-- ============================================================
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  sub_area TEXT,
  incidence_score INTEGER NOT NULL DEFAULT 5 CHECK (incidence_score >= 0 AND incidence_score <= 10),
  importance importance_level NOT NULL DEFAULT 'media',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Temas por aluno
CREATE TABLE student_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status topic_status NOT NULL DEFAULT 'pendente',
  phase study_phase NOT NULL DEFAULT 'construcao',
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  last_studied_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, topic_id)
);

-- ============================================================
-- RELATÓRIOS MENSAIS
-- ============================================================
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  study_hours NUMERIC(5,1),
  accuracy_percentage NUMERIC(5,2),
  simulations_count INTEGER DEFAULT 0,
  topics_completed INTEGER DEFAULT 0,
  topics_pending INTEGER DEFAULT 0,
  perceived_evolution TEXT,
  attention_points TEXT,
  mentor_observations TEXT,
  file_url TEXT,
  file_type TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, month, year)
);

-- ============================================================
-- GUIAS DE ESTUDO
-- ============================================================
CREATE TABLE study_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  next_steps TEXT,
  priority_topics TEXT,
  weekly_goals TEXT,
  revision_schedule TEXT,
  planned_simulations TEXT,
  planned_exams TEXT,
  weekly_checklist TEXT,
  mentor_guidelines TEXT,
  orientador_guidelines TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OFICINAS
-- ============================================================
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  responsible_id UUID REFERENCES profiles(id),
  location TEXT,
  is_online BOOLEAN NOT NULL DEFAULT true,
  meeting_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALERTAS
-- ============================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENTOS CALENDLY (preparado para integração)
-- ============================================================
CREATE TABLE calendly_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  event_id TEXT NOT NULL UNIQUE,
  event_url TEXT,
  event_type TEXT,
  event_name TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOGS DE IA
-- ============================================================
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  meeting_id UUID REFERENCES meetings(id),
  action_type TEXT NOT NULL,
  input_text TEXT,
  output_text TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_students_mentor ON students(mentor_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_next_meeting ON students(next_meeting_at);
CREATE INDEX idx_meetings_student ON meetings(student_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_medical_records_student ON medical_records(student_id);
CREATE INDEX idx_alerts_student ON alerts(student_id);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved) WHERE NOT is_resolved;
CREATE INDEX idx_goals_student ON goals(student_id);
CREATE INDEX idx_weekly_checklists_student ON weekly_checklists(student_id);
CREATE INDEX idx_student_topics_student ON student_topics(student_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_topics ENABLE ROW LEVEL SECURITY;

-- Política base: usuário autenticado vê seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Coordenação e supervisores veem tudo
CREATE POLICY "Coord/Supervisor can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('coordenacao', 'supervisor')
    )
  );

-- Mentores veem seus alunos
CREATE POLICY "Mentor sees own students" ON students
  FOR SELECT USING (
    mentor_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('coordenacao', 'supervisor')
    )
  );

-- Orientadores veem seus alunos
CREATE POLICY "Orientador sees assigned students" ON students
  FOR SELECT USING (
    orientador_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('coordenacao', 'supervisor')
    )
  );

-- ============================================================
-- FUNÇÕES AUTOMÁTICAS
-- ============================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualizar last_meeting_at e next_meeting_at no aluno automaticamente
CREATE OR REPLACE FUNCTION sync_student_meeting_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'realizada' THEN
    UPDATE students SET last_meeting_at = NEW.scheduled_at
    WHERE id = NEW.student_id AND (last_meeting_at IS NULL OR NEW.scheduled_at > last_meeting_at);
  END IF;

  IF NEW.status = 'agendada' AND NEW.scheduled_at > NOW() THEN
    UPDATE students SET next_meeting_at = NEW.scheduled_at
    WHERE id = NEW.student_id AND (next_meeting_at IS NULL OR NEW.scheduled_at < next_meeting_at);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_meeting_dates AFTER INSERT OR UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION sync_student_meeting_dates();

-- ============================================================
-- SEED DE DADOS INICIAIS
-- ============================================================

-- Cursinhos
INSERT INTO prep_courses (name, description, is_active) VALUES
  ('Medcel', 'Plataforma Medcel', true),
  ('Medcof', 'Medcof Residência', true),
  ('Estratégia Med', 'Estratégia Med', true),
  ('Aristo', 'Aristo Medicina', true),
  ('Medway', 'Medway Residência', true);

-- Temas
INSERT INTO topics (name, area, sub_area, incidence_score, importance) VALUES
  ('Hipertensão Arterial', 'Clínica Médica', 'Cardiologia', 9, 'alta'),
  ('Insuficiência Cardíaca', 'Clínica Médica', 'Cardiologia', 8, 'alta'),
  ('DPOC e Asma', 'Clínica Médica', 'Pneumologia', 8, 'alta'),
  ('Diabetes Mellitus', 'Clínica Médica', 'Endocrinologia', 9, 'alta'),
  ('Insuficiência Renal Crônica', 'Clínica Médica', 'Nefrologia', 7, 'alta'),
  ('Infecções em Pediatria', 'Pediatria', 'Infectologia Pediátrica', 8, 'alta'),
  ('Urgências em Obstetrícia', 'Ginecologia e Obstetrícia', 'Obstetrícia', 7, 'alta'),
  ('Trauma e Urgência Cirúrgica', 'Cirurgia Geral', 'Urgência e Emergência', 6, 'media'),
  ('Síndromes Coronarianas Agudas', 'Clínica Médica', 'Cardiologia', 9, 'alta'),
  ('Distúrbios do Equilíbrio Ácido-Base', 'Clínica Médica', 'Nefrologia', 7, 'alta'),
  ('Sepse e Choque', 'Clínica Médica', 'UTI / Medicina de Urgência', 8, 'alta'),
  ('Anemias', 'Clínica Médica', 'Hematologia', 6, 'media'),
  ('Doenças Inflamatórias Intestinais', 'Clínica Médica', 'Gastroenterologia', 6, 'media'),
  ('Epilepsia e Convulsões', 'Clínica Médica', 'Neurologia', 7, 'alta'),
  ('Transtorno Depressivo Maior', 'Psiquiatria', 'Psiquiatria', 6, 'media');
