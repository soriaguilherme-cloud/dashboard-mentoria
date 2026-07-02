'use client'

import { mockStudents, mockProfiles, mockAlerts } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { StudentStatusBadge, RiskScore } from '@/components/shared/status-badge'
import { AlertSeverityBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Users, UserCheck, UserX, Clock, Calendar, Bell } from 'lucide-react'
import Link from 'next/link'

export default function SupervisaoPage() {
  const mentors = mockProfiles.filter(p => p.role === 'mentor')
  const supervisors = mockProfiles.filter(p => p.role === 'supervisor')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supervisão"
        description="Acompanhamento da qualidade operacional dos mentores"
      />

      {/* Stats gerais */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total de Alunos" value={mockStudents.length} icon={Users} variant="info" />
        <StatCard title="Alunos Ativos" value={mockStudents.filter(s => s.status === 'ativo').length} icon={UserCheck} variant="success" />
        <StatCard title="Alunos Inativos" value={mockStudents.filter(s => s.status === 'inativo').length} icon={UserX} variant="warning" />
        <StatCard title="Alunos Críticos" value={mockStudents.filter(s => s.status === 'critico').length} icon={AlertTriangle} variant="danger" />
      </div>

      {/* Alertas operacionais */}
      {mockAlerts.filter(a => !a.is_resolved).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-red-500" />
              Alertas Pendentes da Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockAlerts.filter(a => !a.is_resolved).map(alert => (
                <div key={alert.id} className={`flex items-start gap-3 rounded-lg border-l-4 p-3 ${
                  alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                  alert.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <AlertSeverityBadge severity={alert.severity} />
                    </div>
                    {alert.description && <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Por mentor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Acompanhamento por Mentor</h3>
        {mentors.map(mentor => {
          const mentorStudents = mockStudents.filter(s => s.mentor_id === mentor.id)
          const activeStudents = mentorStudents.filter(s => s.status === 'ativo')
          const criticalStudents = mentorStudents.filter(s => s.status === 'critico')
          const withoutNext = mentorStudents.filter(s => !s.next_meeting_at)
          const delayed = mentorStudents.filter(s => (s.days_since_last_meeting ?? 0) > 21)
          const hasIssues = criticalStudents.length > 0 || withoutNext.length > 0

          return (
            <Card key={mentor.id} className={hasIssues ? 'border-red-200' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{mentor.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{mentorStudents.length} alunos na carteira</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {criticalStudents.length > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        {criticalStudents.length} crítico{criticalStudents.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {withoutNext.length > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        <Calendar className="h-3 w-3" />
                        {withoutNext.length} sem reunião
                      </span>
                    )}
                    {delayed.length > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                        <Clock className="h-3 w-3" />
                        {delayed.length} atrasado{delayed.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {!hasIssues && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        ✓ Operação OK
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground text-xs">Aluno</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground text-xs">Status</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground text-xs">Última Reunião</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground text-xs">Próxima Reunião</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground text-xs">Risco</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentorStudents.map(student => (
                        <tr key={student.id} className="border-b hover:bg-muted/20">
                          <td className="py-2.5 px-2">
                            <Link href={`/alunos/${student.id}`} className="font-medium hover:text-primary hover:underline text-sm">
                              {student.name}
                            </Link>
                          </td>
                          <td className="py-2.5 px-2">
                            <StudentStatusBadge status={student.status} />
                          </td>
                          <td className="py-2.5 px-2">
                            {student.last_meeting_at ? (
                              <span className={`text-xs ${(student.days_since_last_meeting ?? 0) > 21 ? 'text-yellow-700 font-medium' : 'text-muted-foreground'}`}>
                                {new Date(student.last_meeting_at).toLocaleDateString('pt-BR')}
                                {(student.days_since_last_meeting ?? 0) > 21 && ' ⚠️'}
                              </span>
                            ) : (
                              <span className="text-xs text-red-500 font-medium">Nunca</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            {student.next_meeting_at ? (
                              <span className="text-xs text-muted-foreground">
                                {new Date(student.next_meeting_at).toLocaleDateString('pt-BR')}
                              </span>
                            ) : (
                              <span className="text-xs text-red-500 font-medium">Sem reunião</span>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <RiskScore score={student.risk_score} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
