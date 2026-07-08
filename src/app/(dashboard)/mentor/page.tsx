'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockStudents, mockProfiles } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { StudentStatusBadge, RiskScore, StudyPhaseBadge, ActivityBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Users, UserCheck, UserX, AlertTriangle, Calendar, Eye,
  FileText, Clock, ChevronRight, Plus, Bell
} from 'lucide-react'

export default function MentorPage() {
  const { user } = useAuth()

  const mentors = mockProfiles.filter(p => p.role === 'mentor')
  const defaultMentorId = user?.role === 'mentor' ? user.id : mentors[0]?.id
  const [selectedMentorId, setSelectedMentorId] = useState(defaultMentorId ?? '')
  const effectiveMentorId = user?.role === 'mentor' ? user.id : selectedMentorId
  const selectedMentor = mentors.find(m => m.id === effectiveMentorId)
  const myStudents = mockStudents.filter(s => s.mentor_id === effectiveMentorId)

  const activeCount = myStudents.filter(s => s.status === 'ativo').length
  const inactiveCount = myStudents.filter(s => s.status === 'inativo').length
  const criticalCount = myStudents.filter(s => s.status === 'critico').length
  const withoutNextMeeting = myStudents.filter(s => !s.next_meeting_at)
  const delayed = myStudents.filter(s => (s.days_since_last_meeting ?? 0) > 21)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Painel do Mentor"
          description="Visão da sua carteira de alunos"
        />
        <div className="flex items-center gap-3">
          {user?.role !== 'mentor' && (
            <Select value={selectedMentorId} onValueChange={v => v && setSelectedMentorId(v)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecionar mentor" />
              </SelectTrigger>
              <SelectContent>
                {mentors.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Mentor info */}
      {selectedMentor && (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {selectedMentor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold">{selectedMentor.name}</p>
            <p className="text-sm text-muted-foreground">{selectedMentor.email} · Mentor</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold">{myStudents.length}</p>
            <p className="text-xs text-muted-foreground">alunos na carteira</p>
          </div>
        </div>
      )}

      {/* Stats do mentor */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total de Alunos" value={myStudents.length} icon={Users} variant="info" />
        <StatCard title="Ativos" value={activeCount} icon={UserCheck} variant="success" />
        <StatCard title="Inativos" value={inactiveCount} icon={UserX} variant="warning" />
        <StatCard title="Críticos" value={criticalCount} icon={AlertTriangle} variant="danger" />
      </div>

      {/* Alertas do mentor */}
      {(withoutNextMeeting.length > 0 || delayed.length > 0) && (
        <div className="space-y-2">
          {withoutNextMeeting.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border-l-4 border-l-red-500 bg-red-50 p-4">
              <Bell className="h-4 w-4 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {withoutNextMeeting.length} {withoutNextMeeting.length === 1 ? 'aluno' : 'alunos'} sem próxima reunião marcada:
                </p>
                <p className="text-xs text-red-600 mt-0.5">{withoutNextMeeting.map(s => s.name).join(', ')}</p>
              </div>
            </div>
          )}
          {delayed.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border-l-4 border-l-yellow-500 bg-yellow-50 p-4">
              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  {delayed.length} {delayed.length === 1 ? 'aluno' : 'alunos'} com reunião atrasada:
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">{delayed.map(s => `${s.name} (${s.days_since_last_meeting} dias)`).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabela de alunos do mentor */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Minha Carteira de Alunos</CardTitle>
            <Link href="/alunos/novo">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar Aluno
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aluno</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cursinho</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fase</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Prova-Alvo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Última Reunião</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Próxima Reunião</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Atividade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risco</th>
                  <th className="py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {myStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-muted-foreground">
                      Nenhum aluno vinculado a este mentor.
                    </td>
                  </tr>
                ) : (
                  myStudents.map(student => {
                    const isDelayed = (student.days_since_last_meeting ?? 0) > 21
                    return (
                      <tr key={student.id} className={`border-b transition-colors hover:bg-muted/20 ${student.status === 'critico' ? 'bg-red-50/50' : ''}`}>
                        <td className="py-3.5 px-4">
                          <Link href={`/alunos/${student.id}`} className="font-semibold hover:text-primary hover:underline">
                            {student.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{student.desired_specialty}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <StudentStatusBadge status={student.status} />
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
                            <div className={`flex items-center gap-1.5 text-xs ${isDelayed ? 'text-yellow-700 font-medium' : 'text-muted-foreground'}`}>
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
                            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
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
                          <div className="flex items-center gap-1">
                            <Link href={`/alunos/${student.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Ver perfil">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Link href={`/alunos/${student.id}?tab=prontuario`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Prontuário">
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Link href={`/reunioes/nova?aluno=${student.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Nova reunião">
                                <Calendar className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Próximas reuniões */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Próximas Reuniões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myStudents
              .filter(s => s.next_meeting_at)
              .sort((a, b) => new Date(a.next_meeting_at!).getTime() - new Date(b.next_meeting_at!).getTime())
              .map(student => (
                <div key={student.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.desired_specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {format(new Date(student.next_meeting_at!), "dd/MM", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(student.next_meeting_at!), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Link href={`/alunos/${student.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                      Briefing <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            {myStudents.filter(s => s.next_meeting_at).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma reunião agendada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
