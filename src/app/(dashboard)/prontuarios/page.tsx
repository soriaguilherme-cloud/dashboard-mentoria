import { mockMedicalRecords, mockStudents, mockProfiles } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ChevronRight, CheckCircle2, Clock, Plus } from 'lucide-react'
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
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{pending.length}</p>
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
