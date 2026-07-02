'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockStudents, mockProfiles } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Save, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

function NovaReuniaoInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const alunoParam = searchParams.get('aluno') ?? ''

  const [studentId, setStudentId] = useState(alunoParam)
  const [mentorId, setMentorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [type, setType] = useState('individual')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mentors = mockProfiles.filter(p => p.role === 'mentor')
  const selectedStudent = mockStudents.find(s => s.id === studentId)
  const resolvedMentorId = mentorId || selectedStudent?.mentor_id || ''

  function validate() {
    const errs: Record<string, string> = {}
    if (!studentId) errs.student = 'Selecione um aluno'
    if (!resolvedMentorId) errs.mentor = 'Selecione um mentor'
    if (!date) errs.date = 'Informe a data'
    if (!time) errs.time = 'Informe o horário'
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSaved(true)
    setTimeout(() => router.push('/reunioes'), 1200)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/reunioes" className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Reuniões
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Nova Reunião</span>
      </div>

      <PageHeader
        title="Nova Reunião"
        description="Agendar uma nova sessão de mentoria"
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Dados da Reunião
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Aluno */}
            <div className="space-y-1.5">
              <Label htmlFor="student">Aluno *</Label>
              <Select value={studentId} onValueChange={v => { setStudentId(v); setErrors(p => ({ ...p, student: '' })) }}>
                <SelectTrigger id="student" className={cn(errors.student && 'border-red-400')}>
                  <SelectValue placeholder="Selecionar aluno..." />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.student && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.student}</p>}
              {selectedStudent && (
                <p className="text-xs text-muted-foreground">
                  Mentor padrão: {mockProfiles.find(p => p.id === selectedStudent.mentor_id)?.name ?? '—'}
                </p>
              )}
            </div>

            {/* Mentor */}
            <div className="space-y-1.5">
              <Label htmlFor="mentor">Mentor *</Label>
              <Select
                value={resolvedMentorId}
                onValueChange={v => { setMentorId(v); setErrors(p => ({ ...p, mentor: '' })) }}
              >
                <SelectTrigger id="mentor" className={cn(errors.mentor && 'border-red-400')}>
                  <SelectValue placeholder="Selecionar mentor..." />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mentor && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.mentor}</p>}
            </div>

            {/* Data e hora */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: '' })) }}
                  className={cn(errors.date && 'border-red-400')}
                />
                {errors.date && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: '' })) }}
                  className={cn(errors.time && 'border-red-400')}
                />
                {errors.time && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.time}</p>}
              </div>
            </div>

            {/* Duração e tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="duration">Duração (min)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                    <SelectItem value="120">120 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="grupo">Grupo</SelectItem>
                    <SelectItem value="supervisao">Supervisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Local */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Local / Link</Label>
              <Input
                id="location"
                placeholder="https://meet.google.com/... ou endereço"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Pautas, objetivos ou observações para esta reunião..."
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
              <Link href="/reunioes">
                <Button type="button" variant="ghost">Cancelar</Button>
              </Link>
              <Button
                type="submit"
                className="gap-2 bg-primary text-white hover:bg-primary/90"
                disabled={saved}
              >
                <Save className="h-4 w-4" />
                {saved ? 'Salvo! Redirecionando...' : 'Agendar Reunião'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default function NovaReuniaoPage() {
  return (
    <Suspense fallback={null}>
      <NovaReuniaoInner />
    </Suspense>
  )
}
