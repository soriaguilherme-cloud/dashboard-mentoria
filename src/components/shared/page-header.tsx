import { ReactNode } from 'react'
import { Calendar, RefreshCw, Download } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  showDateBadge?: boolean
}

function getMonthLabel() {
  return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

export function PageHeader({ title, description, action, showDateBadge = false }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold leading-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {showDateBadge && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{getMonthLabel()}</span>
          </div>
        )}
        {action}
        {showDateBadge && (
          <>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-white text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-white text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
              <Download className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
