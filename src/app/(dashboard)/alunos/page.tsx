'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockStudents, mockProfiles, mockPrepCourses } from '@/lib/mock-data'
import { Student } from '@/types/database'
import { PageHeader } from '@/components/shared/page-header'
import { StudentStatusBadge, ActivityBadge, RiskScore, StudyPhaseBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, UserPlus, Calendar, Clock, AlertTriangle, Eye, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusFilter = 'todos' | 'ativo' | 'inativo' | 'critico'
type MeetingFilter = 'todos' | 'sem_reuniao' | 'atrasados'

export default function AlunosPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [mentorFilter, setMentorFilter] = useState('todos')
  const [meetingFilter, setMeetingFilter] = useState<MeetingFilter>('todos')

  const mentors = mockProfiles.filter(p => p.role === 'mentor')

  const filtered = mockStudents.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.desired_specialty?.toLowerCase().includes(search.toLowerCase()) &&
        !s.target_exam?.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'todos' && s.status !== statusFilter) return false
    if (mentorFilter !== 'todos' && s.mentor_id !== mentorFilter) return false
    if (meetingFilter === 'sem_reuniao' && s.next_meeting_at) return false
    if (meetingFilter === 'atrasados' && (s.days_since_last_meeting ?? 0) <= 21) return false
    return true
  })

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('todos')
    setMentorFilter('todos')
    setMeetingFilter('todos')
  }

  const hasFilters = search || statusFilter !== 'todos' || mentorFilter !== 'todos' || meetingFilter !== 'todos'

  const countByStatus = (status: 'ativo' | 'inativo' | 'critico') =>
    mockStudents.filter(s => s.status === status).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={`${mockStudents.length} alunos matriculados na Mentoria Residência`}
        action={
          <Link href="/alunos/novo">
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" /> Novo Aluno
            </Button>
          </Link>
        }
      />

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', count: mockStudents.length, className: 'border-border', filter: 'todos' },
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno, especialidade, prova..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-muted-foreground">
                      Nenhum aluno encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((student) => (
                    <StudentRow key={student.id} student={student} />
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

function StudentRow({ student }: { student: Student }) {
  const isDelayed = (student.days_since_last_meeting ?? 0) > 21
  const noNextMeeting = !student.next_meeting_at

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
            {format(new Date(student.last_meeting_at), "dd/MM/yy", { locale: ptBR })}
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
            {format(new Date(student.next_meeting_at), "dd/MM/yy", { locale: ptBR })}
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
