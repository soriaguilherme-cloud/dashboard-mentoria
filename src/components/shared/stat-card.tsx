import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'primary' | 'default' | 'danger' | 'warning' | 'success' | 'info'
  className?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  const isPrimary = variant === 'primary'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        isPrimary
          ? 'bg-gradient-to-br from-primary to-[#e05d10] shadow-lg shadow-primary/25'
          : 'bg-white border border-border/50 shadow-sm',
        className
      )}
    >
      {isPrimary && (
        <div className="absolute -bottom-3 -right-3 opacity-[0.12]">
          <Icon className="h-28 w-28 text-white" />
        </div>
      )}

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <p className={cn(
            'text-sm font-medium',
            isPrimary ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <div className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
            isPrimary
              ? 'bg-white/20 text-white'
              : variant === 'danger'  ? 'bg-red-50 text-red-500'
              : variant === 'warning' ? 'bg-yellow-50 text-yellow-500'
              : variant === 'success' ? 'bg-emerald-50 text-emerald-500'
              : variant === 'info'    ? 'bg-blue-50 text-blue-500'
              : 'bg-muted/60 text-muted-foreground'
          )}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>

        <p className={cn(
          'text-3xl font-bold tracking-tight',
          isPrimary ? 'text-white' : 'text-foreground'
        )}>
          {value}
        </p>

        <div className="flex items-center justify-between gap-2">
          {subtitle && (
            <span className={cn(
              'text-xs',
              isPrimary ? 'text-white/70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </span>
          )}
          {trend && (
            <span className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              trend.value > 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-600'
            )}>
              {trend.value > 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
