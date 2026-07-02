'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mockMeetings } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, Search, Plus, FileText, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusLabel: Record<string, { label: string; className: string }> = {
  realizada: { label: 'Realizada', className: 'bg-emerald-100 text-emerald-800' },
  agendada: { label: 'Agendada', className: 'bg-blue-100 text-blue-800' },
  cancelada: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
}

export default function ReunioesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const filtered = mockMeetings.filter(m => {
    if (search && !m.student?.name.toLowerCase().includes(search.toLowerCase()) && !m.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'todos' && m.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reuniões"
        description="Histórico e agenda de reuniões da mentoria"
        action={
          <Link href="/reunioes/nova">
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Agendar Reunião</Button>
          </Link>
        }
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por aluno ou título..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => v && setStatusFilter(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="agendada">Agendadas</SelectItem>
            <SelectItem value="realizada">Realizadas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aluno</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Título</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duração</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mentor</th>
                <th className="py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(meeting => {
                const statusCfg = statusLabel[meeting.status]
                return (
                  <tr key={meeting.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link href={`/alunos/${meeting.student_id}`} className="font-medium hover:text-primary hover:underline">
                        {meeting.student?.name || '—'}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{meeting.title}</td>
                    <td className="py-3.5 px-4">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusCfg.className)}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs">
                          {format(new Date(meeting.scheduled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {meeting.duration_minutes ? `${meeting.duration_minutes} min` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {meeting.mentor?.name?.split(' ').slice(0, 2).join(' ') || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/reunioes/${meeting.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {meeting.status === 'realizada' && (
                          <Link href={`/reunioes/${meeting.id}?tab=prontuario`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Nenhuma reunião encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
