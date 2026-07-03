'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  Search,
  Stethoscope,
  User,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import {
  mockMedicalRecords,
  mockMeetings,
  mockProfiles,
} from '@/lib/mock-data'
import { useAuth } from '@/lib/auth-context'
import { canAccessPath, getStudentsForUser } from '@/lib/access-control'
import { cn } from '@/lib/utils'

type CommandItem = {
  id: string
  title: string
  subtitle: string
  href: string
  keywords: string
  icon: typeof Search
}

export function CommandMenu({ triggerClassName }: { triggerClassName?: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const scopedStudents = getStudentsForUser(user)

  const items = useMemo<CommandItem[]>(() => {
    if (!user) return []
    const scopedStudentIds = new Set(scopedStudents.map(student => student.id))

    const studentItems = scopedStudents.map(student => ({
      id: `student-${student.id}`,
      title: student.name,
      subtitle: `Aluno · ${student.mentor?.name ?? 'sem mentor'} · ${student.prep_course?.name ?? 'sem cursinho'}`,
      href: `/alunos/${student.id}`,
      keywords: `${student.name} ${student.email ?? ''} ${student.desired_specialty ?? ''} ${student.target_exam ?? ''}`,
      icon: User,
    }))

    const mentorItems = mockProfiles
      .filter(profile => profile.role === 'mentor' && scopedStudents.some(student => student.mentor_id === profile.id))
      .map(profile => ({
        id: `mentor-${profile.id}`,
        title: profile.name,
        subtitle: 'Mentor',
        href: '/alunos',
        keywords: `${profile.name} ${profile.email}`,
        icon: Stethoscope,
      }))

    const meetingItems = mockMeetings
      .filter(meeting => scopedStudentIds.has(meeting.student_id))
      .map(meeting => ({
        id: `meeting-${meeting.id}`,
        title: meeting.title,
        subtitle: `Reunião · ${meeting.student?.name ?? ''}`,
        href: `/reunioes/${meeting.id}`,
        keywords: `${meeting.title} ${meeting.student?.name ?? ''} ${meeting.mentor?.name ?? ''}`,
        icon: Calendar,
      }))

    const recordItems = mockMedicalRecords
      .filter(record => scopedStudentIds.has(record.student_id))
      .map(record => ({
        id: `record-${record.id}`,
        title: `Prontuário · ${record.student?.name ?? 'Aluno'}`,
        subtitle: record.meeting_summary ?? 'Registro pós-reunião',
        href: record.meeting_id ? `/reunioes/${record.meeting_id}` : '/prontuarios',
        keywords: `${record.student?.name ?? ''} ${record.meeting_summary ?? ''} ${record.priority_topics ?? ''}`,
        icon: ClipboardList,
      }))

    const routeItems = [
      { id: 'route-dashboard', title: 'Dashboard', subtitle: 'Visão por perfil', href: '/dashboard', keywords: 'painel indicadores métricas', icon: Users },
      { id: 'route-operacao', title: 'Operação Interna', subtitle: 'Kanban, documentos e comunicação', href: '/operacao', keywords: 'operação kanban qualidade documentos comunicação', icon: Workflow },
      { id: 'route-alunos', title: 'Alunos', subtitle: 'Busca, risco e timeline', href: '/alunos', keywords: 'alunos estudantes risco tags', icon: Users },
      { id: 'route-reunioes', title: 'Reuniões', subtitle: 'Agenda e prontuários', href: '/reunioes', keywords: 'reuniões encontros agenda', icon: Calendar },
      { id: 'route-prontuarios', title: 'Prontuários', subtitle: 'Registros pós-reunião', href: '/prontuarios', keywords: 'prontuários registros encaminhamentos', icon: FileText },
      { id: 'route-alertas', title: 'Alertas', subtitle: 'Pendências acionáveis', href: '/alertas', keywords: 'alertas riscos pendências', icon: Bell },
    ].filter(item => canAccessPath(user.role, item.href))

    return [...routeItems, ...studentItems, ...mentorItems, ...meetingItems, ...recordItems]
  }, [scopedStudents, user])

  const filtered = items
    .filter(item => {
      const normalized = query.toLowerCase().trim()
      if (!normalized) return true
      return `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase().includes(normalized)
    })
    .slice(0, 9)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(value => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function goTo(item: CommandItem) {
    setOpen(false)
    setQuery('')
    router.push(item.href)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'relative flex h-9 w-full items-center rounded-lg border border-border/50 bg-muted/30 pl-9 pr-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-white',
          triggerClassName
        )}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <span className="truncate">Buscar aluno, mentor, reunião...</span>
        <kbd className="ml-auto hidden rounded border bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          Cmd K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-20">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar aluno, mentor, reunião ou prontuário"
                className="h-9 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                aria-label="Fechar busca"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-2">
              {filtered.length > 0 ? (
                filtered.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(item)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted/50"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
