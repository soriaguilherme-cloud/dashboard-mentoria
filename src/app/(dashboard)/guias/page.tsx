import Link from 'next/link'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Plus,
  Send,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockStudents } from '@/lib/mock-data'
import {
  getDocumentsByStatus,
  getStudentDocuments,
  internalGuideTemplates,
} from '@/lib/internal-operations'
import { cn } from '@/lib/utils'

const audienceLabel = {
  mentor: 'Mentor',
  orientador: 'Orientador',
  supervisor: 'Supervisor',
}

const audienceIcon = {
  mentor: Stethoscope,
  orientador: BookOpen,
  supervisor: ShieldCheck,
}

const statusLabel = {
  rascunho: 'Rascunho',
  revisado: 'Revisado',
  enviado: 'Enviado',
}

const statusTone = {
  rascunho: 'bg-yellow-100 text-yellow-800',
  revisado: 'bg-blue-100 text-blue-700',
  enviado: 'bg-emerald-100 text-emerald-700',
}

export default function GuiasPage() {
  const status = getDocumentsByStatus()
  const documents = mockStudents
    .flatMap(student =>
      getStudentDocuments(student.id).map(document => ({ document, student }))
    )
    .sort((a, b) => new Date(b.document.createdAt).getTime() - new Date(a.document.createdAt).getTime())

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guias e Templates Internos"
        description="Modelos usados pelo time para gerar PDFs e enviar ao aluno fora do sistema"
        action={
          <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Novo template
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatusCard label="Rascunhos" value={status.rascunho} icon={Clock} className="border-l-yellow-500" />
        <StatusCard label="Revisados" value={status.revisado} icon={ShieldCheck} className="border-l-blue-500" />
        <StatusCard label="Enviados" value={status.enviado} icon={CheckCircle2} className="border-l-emerald-500" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Templates por tipo de encontro</CardTitle>
          <CardDescription>
            Cada modelo organiza o conteúdo que o mentor transforma em guia pós-reunião, plano ou devolutiva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            {internalGuideTemplates.map(template => {
              const Icon = audienceIcon[template.audience]
              return (
                <div key={template.id} className="flex min-h-[250px] flex-col rounded-xl border border-border/60 p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary">{audienceLabel[template.audience]}</Badge>
                  </div>
                  <p className="text-sm font-semibold">{template.title}</p>
                  <p className="mt-1 text-xs font-medium text-primary">{template.context}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{template.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.sections.slice(0, 3).map(section => (
                      <span key={section} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {section}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{template.recommendedFor}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Documentos gerados pelo time</CardTitle>
              <CardDescription>Status de envio dos guias e planos produzidos para os alunos.</CardDescription>
            </div>
            <Link href="/operacao" className="text-xs font-semibold text-primary hover:underline">
              Ver operação
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Documento</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aluno</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Observação interna</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(({ document, student }) => (
                  <tr key={document.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-semibold">{document.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Criado em {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/alunos/${student.id}`} className="font-medium hover:text-primary hover:underline">
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', statusTone[document.status])}>
                        {statusLabel[document.status]}
                      </span>
                    </td>
                    <td className="max-w-[360px] px-4 py-3 text-xs text-muted-foreground">
                      <span className="line-clamp-2">{document.internalNote}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={document.meetingId ? `/reunioes/${document.meetingId}/relatorio-aluno` : `/alunos/${student.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          {document.status === 'enviado' ? <ExternalLink className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                          Abrir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhum documento interno gerado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string
  value: number
  icon: typeof Clock
  className: string
}) {
  return (
    <Card className={cn('border-l-4 bg-white', className)}>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
