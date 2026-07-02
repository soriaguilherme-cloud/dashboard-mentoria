'use client'

import { Search, Bell } from 'lucide-react'

export function TopBar({ unreadAlerts = 0 }: { unreadAlerts?: number }) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center gap-4 border-b border-border/40 bg-white px-6">
      {/* Search */}
      <div className="relative w-60">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <input
          type="text"
          placeholder="Buscar..."
          className="h-9 w-full rounded-lg border border-border/50 bg-muted/30 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        {/* Alerts bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          {unreadAlerts > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-border/60" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            AL
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-foreground">Dra. Ana Lima</p>
            <p className="text-[11px] leading-tight text-muted-foreground">Coordenação</p>
          </div>
        </div>
      </div>
    </header>
  )
}
