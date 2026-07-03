'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { mockPrepCourses, mockProfiles } from '@/lib/mock-data'
import { Student } from '@/types/database'
import { PageHeader } from '@/components/shared/page-header'
import { StudentStatusBadge, ActivityBadge, RiskScore, StudyPhaseBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, UserPlus, Calendar, Clock, AlertTriangle, Eye, X, Bookmark, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getStudentsForUser } from '@/lib/access-control'
import {
  getRecommendedAction,
  getRiskExplanation,
  getStudentTags,
  StudentTag,
} from '@/lib/operational-intelligence'

type StatusFilter = 'todos' | 'ativo' | 'inativo' | 'critico'
type MeetingFilter = 'todos' | 'sem_reuniao' | 'atrasados'
type PhaseFilter = 'todos' | 'construcao' | 'consolidacao' | 'manutencao'
type RiskFilter = 'todos' | 'baixo' | 'medio' | 'alto'

type FavoriteFilters = {
  search: string
  statusFilter: StatusFilter
  mentorFilter: string
  supervisorFilter: string
  prepCourseFilter: string
  phaseFilter: PhaseFilter
  riskFilter: RiskFilter
  meetingFilter: MeetingFilter
}

// date-only strings like '2025-06-20' parse as UTC midnight, causing off-by-one
// in UTC-3 timezones. Force noon local time to prevent timezone shift.
function parseLocalDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00')
}

function AlunosPageInner() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const filtroParam = searchParams.get('filtro') as MeetingFilter | null
  const scopedStudents = getStudentsForUser(user)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [mentorFilter, setMentorFilter] = useState('todos')
  const [supervisorFilter, setSupervisorFilter] = useState('todos')
  const [prepCourseFilter, setPrepCourseFilter] = useState('todos')
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('todos')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('todos')
  const [meetingFilter, setMeetingFilter] = useState<MeetingFilter>(
    filtroParam === 'sem_reuniao' || filtroParam === 'atrasados' ? filtroParam : 'todos'
  )
  const [favoriteSaved, setFavoriteSaved] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean(window.localStorage.getItem('mentoria-alunos-favorite-filters'))
  })

  const mentors = mockProfiles.filter(p => p.role === 'mentor' && scopedStudents.some(student => student.mentor_id === p.id))
  const supervisors = mockProfiles.filter(p => p.role === 'supervisor' && scopedStudents.some(student => student.supervisor_id === p.id))
  const prepCourses = mockPrepCourses.filter(course => scopedStudents.some(student => student.prep_course_id === course.id))

  const filtered = scopedStudents.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.desired_specialty?.toLowerCase().includes(search.toLowerCase()) &&
        !s.target_exam?.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'todos' && s.status !== statusFilter) return false
    if (mentorFilter !== 'todos' && s.mentor_id !== mentorFilter) return false
    if (supervisorFilter !== 'todos' && s.supervisor_id !== supervisorFilter) return false
    if (prepCourseFilter !== 'todos' && s.prep_course_id !== prepCourseFilter) return false
    if (phaseFilter !== 'todos' && s.study_phase !== phaseFilter) return false
    if (riskFilter === 'baixo' && s.risk_score > 3) return false
    if (riskFilter === 'medio' && (s.risk_score < 4 || s.risk_score > 6)) return false
    if (riskFilter === 'alto' && s.risk_score < 7) return false
    if (meetingFilter === 'sem_reuniao' && s.next_meeting_at) return false
    if (meetingFilter === 'atrasados' && (s.days_since_last_meeting ?? 0) <= 21) return false
    return true
  })

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('todos')
    setMentorFilter('todos')
    setSupervisorFilter('todos')
    setPrepCourseFilter('todos')
    setPhaseFilter('todos')
    setRiskFilter('todos')
    setMeetingFilter('todos')
  }

  function saveFavoriteFilters() {
    const payload: FavoriteFilters = {
      search,
      statusFilter,
      mentorFilter,
      supervisorFilter,
      prepCourseFilter,
      phaseFilter,
      riskFilter,
      meetingFilter,
    }
    window.localStorage.setItem('mentoria-alunos-favorite-filters', JSON.stringify(payload))
    setFavoriteSaved(true)
  }

  function applyFavoriteFilters() {
    const saved = window.localStorage.getItem('mentoria-alunos-favorite-filters')
    if (!saved) return
    const parsed = JSON.parse(saved) as FavoriteFilters
    setSearch(parsed.search ?? '')
    setStatusFilter(parsed.statusFilter ?? 'todos')
    setMentorFilter(parsed.mentorFilter ?? 'todos')
    setSupervisorFilter(parsed.supervisorFilter ?? 'todos')
    setPrepCourseFilter(parsed.prepCourseFilter ?? 'todos')
    setPhaseFilter(parsed.phaseFilter ?? 'todos')
    setRiskFilter(parsed.riskFilter ?? 'todos')
    setMeetingFilter(parsed.meetingFilter ?? 'todos')
  }

  const hasFilters = search ||
    statusFilter !== 'todos' ||
    mentorFilter !== 'todos' ||
    supervisorFilter !== 'todos' ||
    prepCourseFilter !== 'todos' ||
    phaseFilter !== 'todos' ||
    riskFilter !== 'todos' ||
    meetingFilter !== 'todos'

  const countByStatus = (status: 'ativo' | 'inativo' | 'critico') =>
    scopedStudents.filter(s => s.status === status).length

  const canCreateStudent = user?.role === 'coordenacao' || user?.role === 'supervisor'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={`${scopedStudents.length} alunos no seu escopo de acompanhamento`}
        action={
          canCreateStudent ? (
            <Link href="/alunos/novo">
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" /> Novo Aluno
              </Button>
            </Link>
          ) : null
        }
      />

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', count: scopedStudents.length, className: 'border-border', filter: 'todos' },
          { label: 'Ativos', count: countByStatus('ativo'), className: 'border-l-4 border-l-emerald-500', filter: 'ativo' },
          { label: 'Inativos', count: countByStatus('inativo'), className: 'border-l-4 border-l-yellow-500', filter: 'inativo' },
          { label: 'Críticos', count: countByStatus('critico'), className: 'border-l-4 border-l-red-500', filter: 'critico' },
        ].map(({ label, count, className, filter }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(filter as StatusFilter)}
            className={cn(
              'rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md',
              className,
              statusFilter === filter && 'ring-2 ring-primary'
            )}
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{count}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
        <div className="flex w-full items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtros globais
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno, especialidade, prova..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {user?.role !== 'mentor' && (
          <Select value={mentorFilter} onValueChange={v => setMentorFilter(v ?? 'todos')}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filtrar por mentor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os mentores</SelectItem>
              {mentors.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {user?.role === 'coordenacao' && (
          <Select value={supervisorFilter} onValueChange={v => setSupervisorFilter(v ?? 'todos')}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os supervisores</SelectItem>
              {supervisors.map(supervisor => (
                <SelectItem key={supervisor.id} value={supervisor.id}>{supervisor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={prepCourseFilter} onValueChange={v => setPrepCourseFilter(v ?? 'todos')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Cursinho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os cursinhos</SelectItem>
            {prepCourses.map(course => (
              <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={phaseFilter} onValueChange={v => setPhaseFilter((v ?? 'todos') as PhaseFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as fases</SelectItem>
            <SelectItem value="construcao">Construção</SelectItem>
            <SelectItem value="consolidacao">Consolidação</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={v => setRiskFilter((v ?? 'todos') as RiskFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os riscos</SelectItem>
            <SelectItem value="baixo">Baixo (1-3)</SelectItem>
            <SelectItem value="medio">Médio (4-6)</SelectItem>
            <SelectItem value="alto">Alto (7-10)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={meetingFilter} onValueChange={v => setMeetingFilter((v ?? 'todos') as MeetingFilter)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrar por reunião" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="sem_reuniao">Sem reunião marcada</SelectItem>
            <SelectItem value="atrasados">Reunião atrasada (+21 dias)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={saveFavoriteFilters} className="gap-1.5">
          <Bookmark className="h-4 w-4" /> Salvar favorito
        </Button>
        {favoriteSaved && (
          <Button variant="ghost" size="sm" onClick={applyFavoriteFilters} className="gap-1.5 text-primary">
            <Bookmark className="h-4 w-4" /> Aplicar favorito
          </Button>
        )}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
            <X className="h-4 w-4" /> Limpar filtros
          </Button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Students table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aluno</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mentor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cursinho</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fase</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Prova-Alvo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Última Reunião</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Próxima Reunião</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Atividade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risco</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tags</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Próxima ação</th>
                  <th className="py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center">
                      <div className="mx-auto max-w-sm space-y-3">
                        <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
                        <div>
                          <p className="font-medium">Nenhum aluno encontrado</p>
                          <p className="text-sm text-muted-foreground">Ajuste os filtros ou limpe a busca para voltar ao escopo completo.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={clearFilters}>Limpar filtros</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <StudentRow key={student.id} student={student} parseDate={parseLocalDate} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AlunosPage() {
  return (
    <Suspense fallback={null}>
      <AlunosPageInner />
    </Suspense>
  )
}

function StudentRow({ student, parseDate }: { student: Student; parseDate: (s: string) => Date }) {
  const isDelayed = (student.days_since_last_meeting ?? 0) > 21
  const noNextMeeting = !student.next_meeting_at
  const riskReason = getRiskExplanation(student)
  const nextAction = getRecommendedAction(student)
  const tags = getStudentTags(student)

  return (
    <tr className={cn(
      'border-b transition-colors hover:bg-muted/20',
      student.status === 'critico' && 'bg-red-50/50'
    )}>
      <td className="py-3.5 px-4">
        <div>
          <Link href={`/alunos/${student.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">
            {student.name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{student.desired_specialty || '—'}</p>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <StudentStatusBadge status={student.status} />
      </td>
      <td className="py-3.5 px-4 text-xs text-muted-foreground">
        {student.mentor?.name?.split(' ').slice(0, 2).join(' ') || '—'}
      </td>
      <td className="py-3.5 px-4 text-xs text-muted-foreground">
        {student.prep_course?.name || '—'}
      </td>
      <td className="py-3.5 px-4">
        <StudyPhaseBadge phase={student.study_phase} />
      </td>
      <td className="py-3.5 px-4 text-xs text-muted-foreground">
        {student.target_exam || '—'}
      </td>
      <td className="py-3.5 px-4">
        {student.last_meeting_at ? (
          <div className={cn('flex items-center gap-1.5 text-xs', isDelayed ? 'text-yellow-700' : 'text-muted-foreground')}>
            <Clock className="h-3.5 w-3.5" />
            {format(parseDate(student.last_meeting_at), "dd/MM/yy", { locale: ptBR })}
            {isDelayed && <AlertTriangle className="h-3 w-3" />}
          </div>
        ) : (
          <span className="text-xs text-red-500 font-medium">Nunca</span>
        )}
      </td>
      <td className="py-3.5 px-4">
        {student.next_meeting_at ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(parseDate(student.next_meeting_at), "dd/MM/yy", { locale: ptBR })}
          </div>
        ) : (
          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
            <AlertTriangle className="h-3 w-3" /> Sem reunião
          </span>
        )}
      </td>
      <td className="py-3.5 px-4">
        <ActivityBadge level={student.activity_level} />
      </td>
      <td className="py-3.5 px-4">
        <RiskScore score={student.risk_score} />
        <p className="mt-1 max-w-32 text-[11px] leading-snug text-muted-foreground">{riskReason}</p>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex max-w-48 flex-wrap gap-1.5">
          {tags.map(tag => <TagPill key={tag.label} tag={tag} />)}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className={cn(
          'inline-flex max-w-40 rounded-lg px-2 py-1 text-xs font-medium leading-snug',
          noNextMeeting || student.status === 'critico'
            ? 'bg-red-50 text-red-700'
            : isDelayed
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-emerald-50 text-emerald-700'
        )}>
          {nextAction}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <Link href={`/alunos/${student.id}`}>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </td>
    </tr>
  )
}

function TagPill({ tag }: { tag: StudentTag }) {
  return (
    <span className={cn(
      'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
      tag.tone === 'red' && 'bg-red-50 text-red-700',
      tag.tone === 'yellow' && 'bg-yellow-50 text-yellow-700',
      tag.tone === 'emerald' && 'bg-emerald-50 text-emerald-700',
      tag.tone === 'blue' && 'bg-blue-50 text-blue-700',
      tag.tone === 'slate' && 'bg-slate-100 text-slate-700'
    )}>
      {tag.label}
    </span>
  )
}
