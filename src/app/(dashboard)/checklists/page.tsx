import { mockWeeklyChecklists, mockStudents } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, Clock, BookOpen, Activity, Plus, Circle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig = {
  pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  em_andamento: { label: 'Em andamento', className: 'bg-blue-100 text-blue-700' },
  concluido: { label: 'Concluído', className: 'bg-emerald-100 text-emerald-700' },
} as const

function parseChecklist(text: string) {
  return text.split('|').map(item => item.trim()).filter(Boolean)
}

function CheckItem({ text }: { text: string }) {
  const done = text.includes('✅')
  const label = text.replace(/✅|❌/g, '').replace(/\d+%/, '').trim()
  const pct = text.match(/(\d+)%/)
  return (
    <div className="flex items-center gap-2 text-sm">
      {done
        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        : <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />}
      <span className={cn(done ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
      {pct && <span className="ml-auto text-xs text-muted-foreground">{pct[0]}</span>}
    </div>
  )
}

export default function ChecklistsPage() {
  const allStudents = mockStudents
  const withChecklist = mockWeeklyChecklists.map(c => ({
    ...c,
    student: allStudents.find(s => s.id === c.student_id),
  }))

  const studentsWithout = allStudents.filter(
    s => !mockWeeklyChecklists.find(c => c.student_id === s.id)
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Checklists Semanais"
        description="Acompanhamento dos checklists de estudo dos alunos"
        action={
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl">
            <Plus className="h-4 w-4" /> Novo Checklist
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de alunos</p>
            <p className="text-2xl font-bold mt-1">{allStudents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Com checklist</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{withChecklist.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Em andamento</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {withChecklist.filter(c => c.status === 'em_andamento').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sem checklist</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{studentsWithout.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklists */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Semana atual
        </h3>
        {withChecklist.map(cl => {
          const cfg = statusConfig[cl.status as keyof typeof statusConfig] ?? statusConfig.pendente
          const items = cl.weekly_checklist ? parseChecklist(cl.weekly_checklist) : []
          const doneCount = items.filter(i => i.includes('✅')).length
          return (
            <Card key={cl.id} className="overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {cl.student?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{cl.student?.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(cl.week_start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        {' — '}
                        {new Date(cl.week_end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', cfg.className)}>
                    {cfg.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-4">
                {/* Metas */}
                {cl.weekly_goals && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Metas da semana</p>
                    <p className="text-sm text-foreground">{cl.weekly_goals}</p>
                  </div>
                )}

                {/* Itens */}
                {items.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Progresso ({doneCount}/{items.length})
                    </p>
                    <div className="space-y-1.5">
                      {items.map((item, i) => <CheckItem key={i} text={item} />)}
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{cl.study_hours ?? 0}h de estudo</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    <span>{cl.simulations_done ?? 0} simulado{(cl.simulations_done ?? 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{cl.revisions_done ?? 0} revis{(cl.revisions_done ?? 0) !== 1 ? 'ões' : 'ão'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Students without checklist */}
        {studentsWithout.length > 0 && (
          <>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">
              Sem checklist esta semana ({studentsWithout.length})
            </h3>
            <div className="space-y-2">
              {studentsWithout.map(s => (
                <Card key={s.id} className="border-dashed border-yellow-300 bg-yellow-50/40">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700">
                        {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <p className="text-sm font-medium">{s.name}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:bg-primary/10 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Criar checklist
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
