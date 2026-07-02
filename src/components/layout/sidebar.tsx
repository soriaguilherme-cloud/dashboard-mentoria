'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BookOpen, Calendar, Settings,
  GraduationCap, FileText, CheckSquare, BookMarked, Award,
  Bell, UserCog, Stethoscope, LogOut, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard Geral' },
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

  return (
    <aside className="flex h-screen w-[70px] flex-col border-r border-border/40 bg-white">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center justify-center border-b border-border/40">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto py-3 px-2.5 scrollbar-hide">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn('flex flex-col gap-0.5', gi > 0 && 'mt-2 pt-2 border-t border-border/30')}>
            {group.items.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150',
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:bg-primary/8 hover:text-primary'
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 border-t border-border/40 p-2.5">
        <button
          title="Sair"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
  )
}
