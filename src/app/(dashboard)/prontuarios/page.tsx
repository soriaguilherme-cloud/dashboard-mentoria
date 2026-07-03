import { mockMedicalRecords, mockStudents, mockProfiles, mockMeetings } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ChevronRight, Clock, Plus, Sparkles, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ProntuariosPage() {
  const records = mockMedicalRecords.map(r => ({
    ...r,
    student: mockStudents.find(s => s.id === r.student_id),
    mentor: mockProfiles.find(p => p.id === r.mentor_id),
  }))

  const approved = records.filter(r => r.is_approved)
  const pending = records.filter(r => !r.is_approved)
  const recordedMeetingIds = new Set(records.map(record => record.meeting_id))
  const pendingPostMeeting = mockMeetings
    .filter(meeting => meeting.status === 'realizada' && !recordedMeetingIds.has(meeting.id))
    .map(meeting => ({
      ...meeting,
      student: mockStudents.find(student => student.id === meeting.student_id),
      mentor: mockProfiles.find(profile => profile.id === meeting.mentor_id),
    }))
  const templates = [
    { title: 'Acompanhamento regular', description: 'Resumo, evolução, dificuldades, metas e próxima ação.' },
    { title: 'Aluno crítico', description: 'Risco, barreiras, intervenção imediata e plano de retomada.' },
    { title: 'Revisão de prova', description: 'Simulados, temas fracos, estratégia de revisão e agenda.' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prontuários"
        description="Registros longitudinais das sessões de mentoria"
        action={
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl">
            <Plus className="h-4 w-4" /> Novo Prontuário
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de registros</p>
            <p className="text-2xl font-bold mt-1">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Aprovados</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{approved.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pós-reunião pendentes</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{pending.length + pendingPostMeeting.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Status de prontuário pós-reunião</p>
                <p className="text-sm text-muted-foreground">Reuniões realizadas que ainda precisam de registro.</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="space-y-2">
              {pendingPostMeeting.length > 0 ? pendingPostMeeting.map(meeting => (
                <div key={meeting.id} className="flex items-center justify-between gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{meeting.student?.name}</p>
                    <p className="text-xs text-yellow-800">Reunião realizada sem prontuário</p>
                  </div>
                  <Link href={`/reunioes/${meeting.id}?tab=prontuario`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileText className="h-4 w-4" /> Registrar
                    </Button>
                  </Link>
                </div>
              )) : (
                <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                  Todos os prontuários pós-reunião estão em dia.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Templates por tipo de encontro</p>
                <p className="text-sm text-muted-foreground">Modelos prontos para acelerar o registro.</p>
              </div>
            </div>
            <div className="space-y-2">
              {templates.map(template => (
                <div key={template.title} className="rounded-xl border border-border/60 p-3">
                  <p className="text-sm font-semibold">{template.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records list */}
      <div className="space-y-3">
        {records.map(record => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{record.student?.name}</p>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        record.is_approved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-yellow-100 text-yellow-700'
                      )}>
                        {record.is_approved ? 'Aprovado' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mentor: {record.mentor?.name} · {new Date(record.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{record.meeting_summary}</p>
                    {record.priority_topics && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {record.priority_topics.split(',').map(t => (
                          <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {record.next_meeting_referrals && (
                      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                          <Sparkles className="h-3.5 w-3.5" />
                          Encaminhamentos gerados
                        </p>
                        <p className="line-clamp-2 text-xs text-blue-900">{record.next_meeting_referrals}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/reunioes/${record.meeting_id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground flex-shrink-0">
                    Ver reunião <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {records.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium">Nenhum prontuário registrado</p>
              <p className="text-sm text-muted-foreground mt-1">Os prontuários são criados após cada reunião de mentoria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
