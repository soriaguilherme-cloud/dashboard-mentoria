import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Clock, Users, Video, MapPin } from 'lucide-react'

const mockWorkshops = [
  { id: 'w1', title: 'Oficina de Estratégia para ENARE', description: 'Como montar o plano de estudos para o ENARE 2025', scheduled_at: '2025-07-15T19:00:00', duration_minutes: 90, is_online: true, meeting_url: 'https://meet.example.com/oficina1', responsible: 'Dr. Ricardo Oliveira', participants: 12 },
  { id: 'w2', title: 'Revisão de Clínica Médica', description: 'Revisão dos principais temas de Clínica Médica nas provas', scheduled_at: '2025-07-22T19:00:00', duration_minutes: 120, is_online: true, meeting_url: 'https://meet.example.com/oficina2', responsible: 'Dra. Patrícia Costa', participants: 8 },
  { id: 'w3', title: 'Gestão de Ansiedade na Prova', description: 'Técnicas para controle emocional durante as provas de residência', scheduled_at: '2025-08-05T20:00:00', duration_minutes: 60, is_online: false, responsible: 'Dra. Ana Lima', participants: 15 },
]

export default function OficinasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Oficinas"
        description="Calendário de oficinas e eventos da Mentoria Residência"
        action={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Nova Oficina</Button>}
      />

      <div className="space-y-4">
        {mockWorkshops.map(workshop => (
          <Card key={workshop.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{workshop.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{workshop.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(workshop.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(workshop.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {workshop.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {workshop.participants} participantes
                    </span>
                    <span className="flex items-center gap-1.5">
                      {workshop.is_online ? (
                        <><Video className="h-3.5 w-3.5 text-blue-500" /><span className="text-blue-600">Online</span></>
                      ) : (
                        <><MapPin className="h-3.5 w-3.5" />Presencial</>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Responsável: <strong>{workshop.responsible}</strong></p>
                </div>
                <div className="flex gap-2 ml-4">
                  {workshop.is_online && workshop.meeting_url && (
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Video className="h-3.5 w-3.5" /> Acessar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
