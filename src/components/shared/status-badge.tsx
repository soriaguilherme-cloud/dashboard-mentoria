import { cn } from '@/lib/utils'
import { StudentStatus, ActivityLevel, AlertSeverity } from '@/types/database'

const statusConfig: Record<StudentStatus, { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  inativo: { label: 'Inativo', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  critico: { label: 'Crítico', className: 'bg-red-100 text-red-800 border-red-200' },
}

const activityConfig: Record<ActivityLevel, { label: string; className: string }> = {
  alto: { label: 'Alto', className: 'bg-emerald-100 text-emerald-800' },
  medio: { label: 'Médio', className: 'bg-yellow-100 text-yellow-800' },
  baixo: { label: 'Baixo', className: 'bg-red-100 text-red-800' },
}

const severityConfig: Record<AlertSeverity, { label: string; className: string }> = {
  info: { label: 'Info', className: 'bg-blue-100 text-blue-800' },
  warning: { label: 'Atenção', className: 'bg-yellow-100 text-yellow-800' },
  critical: { label: 'Crítico', className: 'bg-red-100 text-red-800' },
}

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const config = statusConfig[status]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      config.className
    )}>
      <span className={cn(
        'mr-1.5 h-1.5 w-1.5 rounded-full',
        status === 'ativo' ? 'bg-emerald-500' : status === 'inativo' ? 'bg-yellow-500' : 'bg-red-500'
      )} />
      {config.label}
    </span>
  )
}

export function ActivityBadge({ level }: { level: ActivityLevel }) {
  const config = activityConfig[level]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      config.className
    )}>
      {config.label}
    </span>
  )
}

export function AlertSeverityBadge({ severity }: { severity: AlertSeverity }) {
  const config = severityConfig[severity]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      config.className
    )}>
      {config.label}
    </span>
  )
}

export function RiskScore({ score }: { score: number }) {
  const getConfig = (s: number) => {
    if (s <= 3) return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Baixo Risco' }
    if (s <= 6) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Médio Risco' }
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Alto Risco' }
  }
  const config = getConfig(score)
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', config.bg, config.color)}>
      {score}/10
    </span>
  )
}

export function StudyPhaseBadge({ phase }: { phase: string }) {
  const phaseMap: Record<string, { label: string; className: string }> = {
    construcao: { label: 'Construção', className: 'bg-blue-100 text-blue-800' },
    consolidacao: { label: 'Consolidação', className: 'bg-purple-100 text-purple-800' },
    manutencao: { label: 'Manutenção', className: 'bg-gray-100 text-gray-800' },
  }
  const config = phaseMap[phase] || { label: phase, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}
