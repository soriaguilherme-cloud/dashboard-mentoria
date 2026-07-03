'use client'

import { Bell } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { roleDescription, roleLabel } from '@/lib/access-control'
import Link from 'next/link'
import { CommandMenu } from '@/components/layout/command-menu'

export function TopBar({ unreadAlerts = 0 }: { unreadAlerts?: number }) {
  const { user } = useAuth()

  return (
    <header className="flex h-16 flex-shrink-0 items-center gap-4 border-b border-border/40 bg-white px-6">
      <div className="w-64 max-w-[45vw]">
        <CommandMenu />
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/alertas"
          aria-label={`${unreadAlerts} alertas pendentes`}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadAlerts > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-primary" />
          )}
        </Link>

        <div className="h-8 w-px bg-border/60" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user?.initials ?? '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-foreground">{user?.name ?? '...'}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">
              {user ? roleLabel[user.role] : ''}
            </p>
          </div>
        </div>
        {user && (
          <div className="hidden max-w-[220px] border-l border-border/60 pl-3 text-[11px] leading-tight text-muted-foreground xl:block">
            {roleDescription[user.role]}
          </div>
        )}
      </div>
    </header>
  )
}
