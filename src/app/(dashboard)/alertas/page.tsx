'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockStudents } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { AlertSeverityBadge } from '@/components/shared/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, AlertCircle, Info, CheckCircle2, CalendarPlus, ExternalLink, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getAlertsForUser } from '@/lib/access-control'
import { getAlertPriority, groupRepeatedAlerts, prioritizeAlerts } from '@/lib/operational-intelligence'

const severityIcon = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const severityBg = {
  critical: 'border-l-red-500 bg-red-50',
  warning: 'border-l-yellow-500 bg-yellow-50',
  info: 'border-l-blue-500 bg-blue-50',
}

export default function AlertasPage() {
  const { user } = useAuth()
  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, { by: string; at: string; action: string }>>({})
  const scopedAlerts = getAlertsForUser(user)
  const alerts = scopedAlerts.map(alert => ({
    ...alert,
    is_resolved: alert.is_resolved || resolvedIds.includes(alert.id),
  }))
  const unresolved = prioritizeAlerts(alerts.filter(a => !a.is_resolved))
  const resolved = alerts.filter(a => a.is_resolved)
  const critical = unresolved.filter(a => a.severity === 'critical').length
  const warning = unresolved.filter(a => a.severity === 'warning').length

  const resolvedNow = resolved.filter(alert => resolvedIds.includes(alert.id))
  const repeatedGroups = groupRepeatedAlerts(unresolved)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas da Operação"
        description={`${unresolved.length} alertas ativos no seu escopo`}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <AlertSummary label="Críticos" value={critical} className="border-l-red-500" />
        <AlertSummary label="Atenção" value={warning} className="border-l-yellow-500" />
        <AlertSummary label="Resolvidos nesta sessão" value={resolvedNow.length} className="border-l-emerald-500" />
      </div>

      {repeatedGroups.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold text-blue-900">Alertas repetidos agrupados para reduzir ruído</p>
            <div className="grid gap-2 md:grid-cols-2">
              {repeatedGroups.map(group => (
                <div key={`${group.type}-${group.title}`} className="rounded-xl bg-white/70 p-3">
                  <p className="text-sm font-semibold">{group.title}</p>
                  <p className="text-xs text-muted-foreground">{group.count} ocorrências · {group.severity === 'critical' ? 'crítico' : 'atenção'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {unresolved.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Alertas Ativos ({unresolved.length})</h3>
          <div className="space-y-2">
            {unresolved.map(alert => {
              const Icon = severityIcon[alert.severity]
              const student = alert.student_id
                ? mockStudents.find(s => s.id === alert.student_id)
                : undefined
              const action = getAlertAction(alert.type, alert.student_id)
              return (
                <Card key={alert.id} className={cn('border-l-4', severityBg[alert.severity])}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0',
                          alert.severity === 'critical' ? 'text-red-500' :
                          alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        )} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{alert.title}</p>
                            <AlertSeverityBadge severity={alert.severity} />
                            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                              Prioridade {getAlertPriority(alert)}
                            </span>
                          </div>
                          {student && (
                            <Link href={`/alunos/${student.id}`} className="mt-1 inline-flex text-xs font-medium text-primary hover:underline">
                              {student.name}
                            </Link>
                          )}
                          {alert.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="mt-1 text-xs font-medium text-foreground">
                            Ação sugerida: {action?.label ?? 'Abrir alerta'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {action && (
                          <Link href={action.href}>
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <action.Icon className="h-4 w-4" /> {action.label}
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-muted-foreground"
                          onClick={() => {
                            setResolvedIds(ids => [...ids, alert.id])
                            setResolutionNotes(notes => ({
                              ...notes,
                              [alert.id]: {
                                by: user?.name ?? 'Usuário',
                                at: new Date().toISOString(),
                                action: action?.label ?? 'Resolvido manualmente',
                              },
                            }))
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Resolver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {unresolved.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500 opacity-50" />
            <p className="font-medium">Nenhum alerta pendente!</p>
            <p className="text-sm text-muted-foreground mt-1">A operação está em dia.</p>
          </CardContent>
        </Card>
      )}

      {resolvedNow.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Histórico desta sessão ({resolvedNow.length})</h3>
          <div className="space-y-2">
            {resolvedNow.map(alert => (
              <Card key={alert.id} className="border-l-4 border-l-emerald-500 bg-emerald-50">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Resolvido por {resolutionNotes[alert.id]?.by ?? user?.name} em{' '}
                        {new Date(resolutionNotes[alert.id]?.at ?? alert.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' '}· {resolutionNotes[alert.id]?.action ?? 'Resolvido manualmente'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResolvedIds(ids => ids.filter(id => id !== alert.id))
                      setResolutionNotes(notes => {
                        const next = { ...notes }
                        delete next[alert.id]
                        return next
                      })
                    }}
                  >
                    Reabrir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AlertSummary({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <Card className={cn('border-l-4 bg-white', className)}>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function getAlertAction(type: string, studentId?: string) {
  if (type === 'sem_reuniao_futura' && studentId) {
    return { href: `/reunioes/nova?aluno=${studentId}`, label: 'Agendar', Icon: CalendarPlus }
  }

  if (type === 'prontuario_pendente') {
    return { href: '/prontuarios', label: 'Prontuários', Icon: FileText }
  }

  if (studentId) {
    return { href: `/alunos/${studentId}`, label: 'Abrir aluno', Icon: ExternalLink }
  }

  return null
}
