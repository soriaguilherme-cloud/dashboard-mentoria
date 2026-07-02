import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Users, Star, Plus, ExternalLink } from 'lucide-react'

const mockGuides = [
  {
    id: 'g1',
    title: 'Guia de Estudos — Clínica Médica',
    description: 'Roteiro completo para estudo de Clínica Médica voltado para residência médica, com cronograma, recursos e estratégias de revisão.',
    area: 'Clínica Médica',
    readTime: '30 min',
    students: 8,
    rating: 4.9,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'g2',
    title: 'Como usar o Anki na Residência',
    description: 'Estratégia de revisão espaçada com Anki adaptada ao contexto de preparação para residência. Decks recomendados e configurações ideais.',
    area: 'Metodologia',
    readTime: '20 min',
    students: 6,
    rating: 4.8,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'g3',
    title: 'Gestão do Tempo no Internato',
    description: 'Como conciliar plantões, estudo e vida pessoal durante o internato. Técnicas de produtividade validadas por residentes aprovados.',
    area: 'Produtividade',
    readTime: '15 min',
    students: 7,
    rating: 4.7,
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'g4',
    title: 'Estratégia para Simulados',
    description: 'Como aproveitar ao máximo os simulados diagnósticos. Análise de erros, metas de acurácia por área e cronograma de revisão pós-simulado.',
    area: 'Simulados',
    readTime: '25 min',
    students: 5,
    rating: 4.9,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'g5',
    title: 'Controle de Ansiedade na Prova',
    description: 'Técnicas cognitivo-comportamentais e de respiração para controle da ansiedade durante provas de residência. Baseado em evidências.',
    area: 'Saúde Mental',
    readTime: '12 min',
    students: 8,
    rating: 4.6,
    color: 'bg-pink-100 text-pink-700',
  },
  {
    id: 'g6',
    title: 'Plano de Estudos — ENARE 2025',
    description: 'Cronograma detalhado de 12 meses para o ENARE. Distribuição de carga horária por área, materiais recomendados e marcos de avaliação.',
    area: 'ENARE',
    readTime: '45 min',
    students: 4,
    rating: 5.0,
    color: 'bg-indigo-100 text-indigo-700',
  },
]

export default function GuiasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Guias de Estudo"
        description="Recursos e roteiros de estudo para os alunos da mentoria"
        action={
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl">
            <Plus className="h-4 w-4" /> Novo Guia
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockGuides.map(guide => (
          <Card key={guide.id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardContent className="p-5 flex flex-col flex-1">
              {/* Area badge */}
              <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${guide.color}`}>
                {guide.area}
              </span>

              <h3 className="font-semibold text-sm leading-snug mb-2">{guide.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{guide.description}</p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {guide.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {guide.students} alunos
                  </span>
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-3.5 w-3.5 fill-yellow-400" /> {guide.rating}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary hover:bg-primary/10 text-xs px-2">
                  Abrir <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
