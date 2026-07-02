'use client'

import { useState } from 'react'
import { mockTopics } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Plus, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const importanceConfig = {
  alta: { label: 'Alta', className: 'bg-red-100 text-red-800' },
  media: { label: 'Média', className: 'bg-yellow-100 text-yellow-800' },
  baixa: { label: 'Baixa', className: 'bg-gray-100 text-gray-600' },
}

export default function TemasPage() {
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('todos')

  const areas = [...new Set(mockTopics.map(t => t.area))]

  const filtered = mockTopics.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    if (areaFilter !== 'todos' && t.area !== areaFilter) return false
    return true
  }).sort((a, b) => b.incidence_score - a.incidence_score)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Temas e Incidência"
        description="Banco de temas com incidência nas provas de residência"
        action={
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novo Tema</Button>
        }
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar tema..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={areaFilter} onValueChange={v => v && setAreaFilter(v)}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as áreas</SelectItem>
            {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tema</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Área</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subárea</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Incidência</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Importância</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(topic => {
                const imp = importanceConfig[topic.importance]
                return (
                  <tr key={topic.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium">{topic.name}</td>
                    <td className="py-3.5 px-4 text-sm text-muted-foreground">{topic.area}</td>
                    <td className="py-3.5 px-4 text-sm text-muted-foreground">{topic.sub_area || '—'}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-gray-200 rounded-full w-24 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', topic.incidence_score >= 8 ? 'bg-red-500' : topic.incidence_score >= 6 ? 'bg-yellow-500' : 'bg-emerald-500')}
                            style={{ width: `${topic.incidence_score * 10}%` }}
                          />
                        </div>
                        <span className={cn('text-xs font-semibold', topic.incidence_score >= 8 ? 'text-red-600' : topic.incidence_score >= 6 ? 'text-yellow-600' : 'text-gray-600')}>
                          {topic.incidence_score}/10
                        </span>
                        {topic.incidence_score >= 8 && <Flame className="h-3.5 w-3.5 text-red-500" />}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', imp.className)}>
                        {imp.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
