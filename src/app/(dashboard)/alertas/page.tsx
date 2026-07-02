import { mockAlerts } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { AlertSeverityBadge } from '@/components/shared/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const unresolved = mockAlerts.filter(a => !a.is_resolved)
  const resolved = mockAlerts.filter(a => a.is_resolved)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas da Operação"
        description={`${unresolved.length} alertas não resolvidos`}
      />

      {unresolved.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Alertas Ativos ({unresolved.length})</h3>
          <div className="space-y-2">
            {unresolved.map(alert => {
              const Icon = severityIcon[alert.severity]
              return (
                <Card key={alert.id} className={cn('border-l-4', severityBg[alert.severity])}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0',
                          alert.severity === 'critical' ? 'text-red-500' :
                          alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        )} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{alert.title}</p>
                            <AlertSeverityBadge severity={alert.severity} />
                          </div>
                          {alert.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4" /> Resolver
                      </Button>
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
    </div>
  )
}
