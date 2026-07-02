'use client'

import { Alert } from '@/types/database'
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const severityIcon = {
  critical: { Icon: AlertCircle, className: 'text-red-500' },
  warning: { Icon: AlertTriangle, className: 'text-yellow-500' },
  info: { Icon: Info, className: 'text-blue-500' },
}

const severityBg = {
  critical: 'border-l-red-500 bg-red-50',
  warning: 'border-l-yellow-500 bg-yellow-50',
  info: 'border-l-blue-500 bg-blue-50',
}

interface AlertsPanelProps {
  alerts: Alert[]
  maxItems?: number
}

export function AlertsPanel({ alerts, maxItems = 5 }: AlertsPanelProps) {
  const displayed = alerts.slice(0, maxItems)
  const unresolved = alerts.filter(a => !a.is_resolved)

  return (
    <div className="space-y-2">
      {unresolved.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
          <Info className="h-4 w-4" />
          Nenhum alerta pendente. Operação em dia!
        </div>
      ) : (
        displayed.map((alert) => {
          const { Icon, className: iconClass } = severityIcon[alert.severity]
          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-l-4 p-3',
                severityBg[alert.severity]
              )}
            >
              <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', iconClass)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                {alert.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.description}</p>
                )}
              </div>
            </div>
          )
        })
      )}
      {alerts.length > maxItems && (
        <Link href="/alertas" className="block text-center text-xs text-primary hover:underline pt-1">
          Ver todos os {alerts.length} alertas →
        </Link>
      )}
    </div>
  )
}
