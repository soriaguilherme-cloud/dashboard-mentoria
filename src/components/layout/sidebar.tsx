'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  GraduationCap, FileText, CheckSquare, BookMarked, Award,
  Bell, UserCog, Stethoscope, LogOut, ClipboardList,
  PanelLeftClose, PanelLeftOpen, Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { canAccessPath } from '@/lib/access-control'

const navGroups = [
  {
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard Geral' },
      { href: '/operacao', icon: Workflow, label: 'Operação Interna' },
      { href: '/mentor', icon: Stethoscope, label: 'Painel do Mentor' },
      { href: '/supervisao', icon: UserCog, label: 'Supervisão' },
    ],
  },
  {
    items: [
      { href: '/alunos', icon: Users, label: 'Alunos' },
      { href: '/reunioes', icon: Calendar, label: 'Reuniões' },
      { href: '/prontuarios', icon: ClipboardList, label: 'Prontuários' },
      { href: '/checklists', icon: CheckSquare, label: 'Checklists' },
    ],
  },
  {
    items: [
      { href: '/cursinhos', icon: GraduationCap, label: 'Cursinhos' },
      { href: '/temas', icon: BookMarked, label: 'Temas e Incidência' },
      { href: '/guias', icon: BookOpen, label: 'Guias de Estudo' },
      { href: '/relatorios', icon: FileText, label: 'Relatórios' },
    ],
  },
  {
    items: [
      { href: '/oficinas', icon: Award, label: 'Oficinas' },
      { href: '/alertas', icon: Bell, label: 'Alertas' },
      { href: '/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('mentoria-sidebar-expanded') === 'true'
  })

  function toggleExpanded() {
    setExpanded(value => {
      window.localStorage.setItem('mentoria-sidebar-expanded', String(!value))
      return !value
    })
  }

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <aside className={cn(
      'flex h-screen flex-col border-r border-border/40 bg-white transition-[width] duration-200',
      expanded ? 'w-64' : 'w-[70px]'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex h-16 flex-shrink-0 items-center border-b border-border/40 px-3',
        expanded ? 'justify-between' : 'justify-center'
      )}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          {expanded && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Mentoria</p>
              <p className="truncate text-[11px] text-muted-foreground">Residência médica</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleExpanded}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            !expanded && 'sr-only'
          )}
          aria-label="Recolher menu"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-3 px-2.5 scrollbar-hide">
        {!expanded && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Expandir menu"
          >
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          </button>
        )}
        {navGroups.map((group, gi) => {
          const visibleItems = user
            ? group.items.filter(item => canAccessPath(user.role, item.href))
            : []

          if (visibleItems.length === 0) return null

          return (
          <div key={gi} className={cn('flex flex-col gap-0.5', gi > 0 && 'mt-2 pt-2 border-t border-border/30')}>
            {visibleItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    'flex h-10 items-center rounded-xl transition-all duration-150',
                    expanded ? 'w-full justify-start gap-3 px-3' : 'w-10 justify-center',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:bg-primary/8 hover:text-primary'
                  )}
                >
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                  {expanded && <span className="truncate text-sm font-medium">{label}</span>}
                </Link>
              )
            })}
          </div>
        )})}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 border-t border-border/40 p-2.5">
        <button
          type="button"
          title="Sair"
          onClick={handleLogout}
          className={cn(
            'flex h-10 items-center rounded-xl text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500',
            expanded ? 'w-full justify-start gap-3 px-3' : 'w-10 justify-center'
          )}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {expanded && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  )
}
