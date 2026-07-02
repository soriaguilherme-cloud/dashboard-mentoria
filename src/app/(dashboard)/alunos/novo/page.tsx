'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { mockProfiles, mockPrepCourses } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Save } from 'lucide-react'

const studentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'critico']),
  study_phase: z.enum(['construcao', 'consolidacao', 'manutencao']),
  target_exam: z.string().optional(),
  target_institution: z.string().optional(),
  desired_specialty: z.string().optional(),
  prep_course_id: z.string().optional(),
  mentor_id: z.string().optional(),
  orientador_id: z.string().optional(),
})

type StudentForm = z.infer<typeof studentSchema>

export default function NovoAlunoPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: { status: 'ativo', study_phase: 'construcao' }
  })

  const mentors = mockProfiles.filter(p => p.role === 'mentor')
  const orientadores = mockProfiles.filter(p => p.role === 'orientador')

  const onSubmit = (data: StudentForm) => {
    console.log('Novo aluno:', data)
    alert('Aluno cadastrado com sucesso! (Integração com Supabase necessária para persistência)')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/alunos" className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Alunos
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Novo Aluno</span>
      </div>

      <PageHeader
        title="Cadastro de Aluno"
        description="Adicionar novo aluno à Mentoria Residência"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Dados Pessoais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome completo *</Label>
                  <Input {...register('name')} placeholder="Nome do aluno" className="mt-1.5" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>Email</Label>
                  <Input {...register('email')} placeholder="email@example.com" type="email" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Telefone</Label>
                <Input {...register('phone')} placeholder="(11) 99999-0000" className="mt-1.5 max-w-xs" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Dados Acadêmicos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Especialidade desejada</Label>
                  <Input {...register('desired_specialty')} placeholder="Ex: Clínica Médica" className="mt-1.5" />
                </div>
                <div>
                  <Label>Prova-alvo</Label>
                  <Input {...register('target_exam')} placeholder="Ex: ENARE 2025" className="mt-1.5" />
                </div>
                <div>
                  <Label>Instituição-alvo</Label>
                  <Input {...register('target_institution')} placeholder="Ex: USP" className="mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cursinho</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecionar cursinho" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPrepCourses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fase de estudo</Label>
                  <Select defaultValue="construcao">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="construcao">Construção</SelectItem>
                      <SelectItem value="consolidacao">Consolidação</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Equipe Responsável</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Mentor</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecionar mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentors.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Orientador de Estudo</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecionar orientador" />
                    </SelectTrigger>
                    <SelectContent>
                      {orientadores.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status inicial</Label>
                  <Select defaultValue="ativo">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="critico">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" /> Cadastrar Aluno
            </Button>
            <Link href="/alunos">
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
