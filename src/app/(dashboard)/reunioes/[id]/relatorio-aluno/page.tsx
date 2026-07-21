'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileText,
  GraduationCap,
  HelpCircle,
  Library,
  Lightbulb,
  Mail,
  MessageCircle,
  Monitor,
  NotebookPen,
  PlayCircle,
  Search,
  Send,
  Sparkles,
  Target,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { mockMeetings, mockMedicalRecords } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { exportVisualPdf } from '@/lib/visual-pdf-export'

type ReportIcon = typeof FileText

export default function RelatorioAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const meeting = mockMeetings.find(m => m.id === id)
  if (!meeting) notFound()

  const record = mockMedicalRecords.find(r => r.meeting_id === id)
  if (!meeting.student || !meeting.mentor) notFound()
  const student = meeting.student
  const mentor = meeting.mentor

  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLElement>(null)
  const fitRef = useRef<HTMLDivElement>(null)
  const firstName = student.name.split(' ')[0]
  const meetingNumber = getMeetingNumber(meeting.id)
  const dateLabel = format(new Date(meeting.scheduled_at), 'dd/MM/yyyy', { locale: ptBR })
  const fullDateLabel = format(new Date(meeting.scheduled_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const prepCourse = student.prep_course?.name ?? 'cursinho principal'
  const reportVariant = getReportVariant({ meetingNumber, studentRisk: student.risk_score, record })
  const fileName = `Guia de Estudos - ${student.name} - Reuniao ${meetingNumber}.pdf`
  const reportText = buildShareText({ firstName, meeting, record })
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(reportText)}`

  const goals = splitLines(record?.goals)
  const nextSteps = splitLines(record?.next_steps)
  const weeklyItems = splitLines(record?.weekly_checklist)
  const doubts = buildDoubts(record)
  const weekPlan = buildWeekPlan(record, prepCourse)
  const weeklySchedule = buildWeeklySchedule({ record, prepCourse })

  // No mobile, escala o preview A4 para caber na largura da tela (só visual).
  // O PDF continua sendo capturado em tamanho real (210mm) — ver exportReportPdf.
  const applyFit = useCallback((forceFull = false) => {
    const wrap = fitRef.current
    const article = reportRef.current
    if (!wrap || !article) return
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    if (forceFull || !isMobile) {
      article.style.width = ''
      article.style.transform = ''
      article.style.transformOrigin = ''
      wrap.style.height = ''
      return
    }
    // Largura real de uma folha A4 (210mm @ 96dpi). Forçamos o artigo a esse
    // tamanho e escalamos para caber na largura disponível — assim o preview
    // é uma miniatura fiel do PDF, sem reflow.
    const A4_PX = 793.7
    article.style.width = `${A4_PX}px`
    article.style.transformOrigin = 'top left'
    const scale = Math.min(1, wrap.clientWidth / A4_PX)
    article.style.transform = `scale(${scale})`
    wrap.style.height = `${article.offsetHeight * scale}px`
  }, [])

  useEffect(() => {
    applyFit()
    const t = setTimeout(applyFit, 400) // recalcula após fontes/imagens
    const onResize = () => applyFit()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [applyFit])

  async function copyReport() {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function exportReportPdf() {
    if (!reportRef.current) return

    setIsExporting(true)
    applyFit(true) // remove a escala mobile para capturar em tamanho real
    try {
      await exportVisualPdf(reportRef.current, { filename: fileName })
    } finally {
      setIsExporting(false)
      applyFit() // restaura a escala mobile
    }
  }

  return (
    <div className="student-guide-page mx-auto max-w-5xl space-y-4">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }

        .student-guide-sheet {
          width: 210mm;
          min-height: 297mm;
          page-break-after: always;
        }

        .student-guide-sheet:last-child {
          page-break-after: auto;
        }

        @media print {
          aside,
          header,
          .no-print {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          main,
          .student-guide-page {
            padding: 0 !important;
            overflow: visible !important;
          }

          .student-guide-document {
            gap: 0 !important;
          }

          .student-guide-sheet {
            width: 210mm !important;
            min-height: 297mm !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
          }

          .print-avoid {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/reunioes/${meeting.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para reunião
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2" onClick={() => setSent(true)}>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
          <Button variant="outline" className="gap-2" onClick={copyReport}>
            <ClipboardCopy className="h-4 w-4" />
            {copied ? 'Copiado' : 'Copiar texto'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setSent(true)}>
            <Send className="h-4 w-4" />
            {sent ? 'Enviado' : 'Marcar enviado'}
          </Button>
          <Button className="gap-2" onClick={exportReportPdf} disabled={isExporting}>
            <Download className="h-4 w-4" />
            {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      <div className="no-print rounded-xl border border-border/60 bg-white p-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Nome sugerido do arquivo</p>
            <p>{fileName}</p>
          </div>
          <div className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            sent ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'
          )}>
            {sent ? 'Marcado como enviado nesta sessão' : 'Ainda não marcado como enviado'}
          </div>
        </div>
      </div>

      <p className="no-print text-center text-xs text-muted-foreground md:hidden">
        Pré-visualização em escala reduzida. O PDF é gerado em tamanho real (A4).
      </p>

      <div ref={fitRef} className="w-full overflow-hidden md:overflow-visible">
      <article ref={reportRef} className="student-guide-document flex flex-col items-center gap-5">
        <GuidePage footer={`Mentoria Residência · ${mentor.name} · Reunião ${meetingNumber} — ${dateLabel}`}>
          <GuideHeader
            kicker={`Mentoria individual · Reunião ${meetingNumber}`}
            rightTop={mentor.name}
            rightBottom={`Mentor(a) · ${dateLabel}`}
          />

          <div className="mt-12">
            <div className="mb-10 h-[44px] w-[225px]">
              <Image src="/mentoria-logo.png" alt="Mentoria Residência" width={225} height={44} priority />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{reportVariant.label}</p>
            <h1 className="mt-4 text-[42px] font-extrabold leading-tight tracking-tight text-foreground">Guia de Estudos</h1>
            <p className="mt-4 max-w-[610px] text-[19px] font-semibold leading-relaxed text-[#4B5563]">
              {firstName}, {reportVariant.headline}
            </p>
          </div>

          <IntroBlock>
            <p>
              Oi, {firstName}. {reportVariant.intro}
            </p>
            <p>
              Guarda este material perto de você. Ele é o seu norte para executar a semana com clareza e chegar na próxima reunião com dados bons para ajustarmos a rota.
            </p>
          </IntroBlock>

          <GuideSection icon={Users} title="Seu time na mentoria">
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              Você não está sozinho(a) nesse processo. Entender o papel de cada pessoa ajuda a acionar o suporte certo no momento certo.
            </p>
            <div className="space-y-4">
              <TeamMember
                name={mentor.name}
                role="Mentor(a) — seu principal contato"
                text="Conduz sua estratégia de estudos, define prioridades, acompanha metas, analisa desempenho e faz as reuniões individuais."
              />
              <TeamMember
                name={student.orientador?.name ?? 'Orientador(a) de estudos'}
                role="Orientação de estudos"
                text="Acompanha a rotina prática da semana, checklist, organização do cronograma e ajustes finos do dia a dia."
              />
              <TeamMember
                name={student.supervisor?.name ?? 'Supervisão'}
                role="Supervisão"
                text="Monitora riscos, consistência do acompanhamento e qualidade da operação para garantir que nada importante fique solto."
              />
              <TeamMember
                name="Concierge"
                role="Suporte administrativo"
                text="Ajuda com questões administrativas, acesso à plataforma, dúvidas operacionais e ajustes de suporte."
              />
            </div>
          </GuideSection>
        </GuidePage>

        <GuidePage footer={`Mentoria Residência · ${mentor.name} · Reunião ${meetingNumber} — ${dateLabel}`}>
          <GuideHeader
            kicker="Plataforma e registros"
            rightTop={student.name}
            rightBottom={fullDateLabel}
          />

          <GuideSection icon={Monitor} title="A plataforma de estudos">
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              A plataforma é o centro do acompanhamento. É por ela que o time enxerga seu progresso, identifica gargalos e ajusta suas próximas metas.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <PlatformItem icon={CalendarDays} title="Cronograma" text="Sua aba principal. Registre estudos, questões, revisões e pendências." />
              <PlatformItem icon={BarChart3} title="Desempenho" text="Painel de acertos, horas, questões feitas e evolução por matéria." />
              <PlatformItem icon={Search} title="Incidências" text="Temas mais cobrados para direcionar estudo por prova e instituição." />
              <PlatformItem icon={Library} title="Biblioteca" text="Materiais de apoio, resumos, apostilas e conteúdos estruturados." />
              <PlatformItem icon={Video} title="Transmissões" text="Aulas gravadas, mentorias coletivas e conteúdos que ficam disponíveis depois." />
              <PlatformItem icon={PlayCircle} title="Vídeos" text="Trilha rápida para revisar método, plataforma e primeiros passos." />
              <PlatformItem icon={Zap} title="Flashcards" text="Use como apoio quando fizer sentido, mantendo o cursinho como base principal." />
              <PlatformItem icon={NotebookPen} title="Anotações" text="Espaço para registrar dúvidas, erros frequentes e pontos que precisam voltar." />
            </div>
          </GuideSection>

          <GuideSection icon={BookOpen} title="Registrando uma aula teórica">
            <StepList items={[
              'Abrir o cronograma na visualização por dia.',
              'Clicar em adicionar estudo e selecionar o tipo teórico.',
              `Preencher cursinho (${prepCourse}), especialidade, tema, data e tempo de estudo.`,
              'Manter a revisão inteligente ativada quando a plataforma permitir.',
              'Escolher o primeiro contato em 24h ou 48h após a aula.',
              'Salvar o estudo e conferir se ele apareceu no calendário como pendente.',
            ]} />
          </GuideSection>

          <GuideSection icon={Target} title="Registrando um bloco de questões">
            <StepList items={[
              'No dia programado, marcar o estudo como concluído.',
              'Preencher tempo de estudo, questões feitas e questões acertadas.',
              'Registrar o bloco no cursinho correto para não misturar métricas.',
              'Manter a revisão inteligente ativada sempre que fizer sentido.',
              'Concluir o registro para a plataforma calcular a próxima revisão.',
            ]} />
          </GuideSection>
        </GuidePage>

        <GuidePage footer={`Mentoria Residência · ${mentor.name} · Reunião ${meetingNumber} — ${dateLabel}`}>
          <GuideHeader
            kicker="Método de estudo"
            rightTop={student.name}
            rightBottom={student.target_exam ?? 'Prova-alvo em acompanhamento'}
          />

          <GuideSection icon={GraduationCap} title="Seu fluxo de estudos">
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              A mentoria é baseada em execução e dados. O aprendizado fica mais forte quando você transforma teoria em questões, correção e revisão.
            </p>

            <div className="mb-7 flex items-center justify-between rounded-2xl bg-[#FFF7F0] px-6 py-5">
              {['Pré-aula', 'Teórico', 'Primeiro contato', 'Revisões'].map((label, index) => (
                <div key={label} className="flex flex-1 items-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{index + 1}</div>
                    <p className="mt-2 text-xs font-bold text-[#55331F]">{label}</p>
                  </div>
                  {index < 3 && <div className="mx-4 h-px flex-1 bg-primary/30" />}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <FlowBlock
                title="Questões pré-aula"
                subtitle="Antes de entrar no tema principal"
                items={[
                  'Use poucas questões para aquecer e chegar na aula com radar ligado.',
                  'Não precisa acertar tudo. O objetivo é perceber o tema antes da teoria.',
                  'Se não der tempo, não trave: siga para a aula e retome depois.',
                ]}
              />
              <FlowBlock
                title="Estudo teórico"
                subtitle="Base objetiva do conteúdo"
                items={[
                  'Assista ou leia buscando entender estrutura, conceitos-chave e pontos recorrentes.',
                  'Anote dúvidas e erros prováveis para checar nas questões.',
                  'Depois da aula, registre os temas na plataforma.',
                ]}
              />
              <FlowBlock
                title="Primeiro contato com questões"
                subtitle="Idealmente em 24h a 48h"
                items={[
                  'Faça um bloco de questões por tema enquanto o conteúdo ainda está fresco.',
                  'Corrija de forma ativa: identifique o motivo do erro e registre padrões.',
                  'Atualize a plataforma com tempo, questões feitas e acertos.',
                ]}
              />
              <FlowBlock
                title="Revisões intervaladas"
                subtitle="Geradas ou planejadas a partir do desempenho"
                items={[
                  'Acertos altos permitem espaçar mais a revisão.',
                  'Acertos baixos pedem retorno mais próximo ao tema.',
                  'Use caderno de erros para fixar o que ficou frágil.',
                ]}
              />
            </div>
          </GuideSection>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <RoadmapCard title="Agora" text={student.study_phase === 'construcao' ? 'Consolidar rotina e manter consistência semanal.' : 'Manter ritmo com ajustes pontuais.'} />
            <RoadmapCard title="Em breve" text="Aumentar volume de questões e reduzir atrasos no cronograma." />
            <RoadmapCard title="Meta final" text={student.target_exam ? `Chegar competitivo(a) para ${student.target_exam}.` : 'Chegar com revisão ativa e bom controle de desempenho.'} />
          </div>
        </GuidePage>

        <GuidePage footer={`Mentoria Residência · ${mentor.name} · Reunião ${meetingNumber} — ${dateLabel}`}>
          <GuideHeader
            kicker="Dúvidas e ajustes"
            rightTop={student.name}
            rightBottom="Resumo para consulta rápida"
          />

          <GuideSection icon={HelpCircle} title="Dúvidas que você tirou na reunião">
            <div className="space-y-4">
              {doubts.map(item => (
                <QuestionBlock key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </GuideSection>

          <GuideSection icon={Lightbulb} title="Dicas importantes">
            <div className="grid grid-cols-2 gap-4">
              <TipCard title="Questões sem pressão" text="No começo, use questões para aprender e mapear lacunas. O erro bem corrigido vira direção." />
              <TipCard title="Caderno de erros" text="Depois de corrigir, registre o que errou, por que errou e qual detalhe precisa revisar." />
              <TipCard title="Correção ativa" text={record?.what_worked ?? 'Teste corrigir questão por questão ou por bloco. O melhor método é o que você consegue repetir.'} />
              <TipCard title="Ajuste rápido" text={record?.what_didnt_work ?? 'Se a semana travar, reduza a tarefa, retome o básico e avise o time antes de acumular.'} />
              <TipCard title="Aulas e materiais" text="Se uma aula não render, vá para questões e use o material para fechar as lacunas depois." />
              <TipCard title="Registre sempre" text="O registro é o que permite acompanhar sua evolução e ajustar a mentoria com precisão." />
            </div>
          </GuideSection>
        </GuidePage>

        <GuidePage footer={`Mentoria Residência · ${mentor.name} · Reunião ${meetingNumber} — ${dateLabel}`}>
          <GuideHeader
            kicker="Metas"
            rightTop={student.name}
            rightBottom={student.desired_specialty ?? 'Especialidade em acompanhamento'}
          />

          <GuideSection icon={Target} title={`Suas metas — ${dateLabel}`}>
            <div className="grid grid-cols-4 gap-3">
              <GoalCard value={getGoalMetric(goals, 'quest') ?? '100'} label="questões/semana" sublabel="volume inicial" />
              <GoalCard value={getGoalMetric(goals, 'acert') ?? '60%'} label="de acertos" sublabel="meta mínima" />
              <GoalCard value={getGoalMetric(goals, 'hora') ?? '10h'} label="estudo/semana" sublabel="constância" />
              <GoalCard value={getGoalMetric(goals, 'simulado') ?? '1+'} label="prova/simulado" sublabel="no ciclo" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Essas metas serão ajustadas conforme os primeiros dados registrados entrarem na plataforma. O aumento precisa ser progressivo, sustentável e guiado pelo seu desempenho real.
            </p>
          </GuideSection>

          <GuideSection icon={CalendarDays} title="Plano da semana">
            <WeeklyPlanTable rows={weeklySchedule} />
          </GuideSection>

          <GuideSection icon={FileText} title="Resumo da reunião">
            <div className="rounded-2xl border border-border/60 p-5">
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {record?.meeting_summary ?? 'Conversamos sobre o momento atual, principais dificuldades, próximos passos e a melhor forma de organizar a semana.'}
              </p>
            </div>
          </GuideSection>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <HighlightBox title="Principais avanços" tone="success" text={record?.main_advances ?? 'Manter os pontos que já estão funcionando e repetir a rotina que trouxe mais consistência.'} />
            <HighlightBox title="Pontos de atenção" tone="warning" text={record?.attention_points ?? record?.main_difficulties ?? 'Acompanhar constância, atrasos e execução das tarefas combinadas.'} />
          </div>
        </GuidePage>

        <GuidePage footer={`Mentoria Residência · ${mentor.name} · Reunião ${meetingNumber} — ${dateLabel}`}>
          <GuideHeader
            kicker="Combinados"
            rightTop={student.name}
            rightBottom="Próximos passos"
          />

          <GuideSection icon={CheckCircle2} title="Combinados e próximos passos">
            <div className="grid gap-5">
              <PlanGroup title="Esta semana" items={weekPlan.thisWeek} />
              <PlanGroup title="Para o próximo ciclo" items={nextSteps.length ? nextSteps : weekPlan.nextCycle} />
              <PlanGroup title="Checklist de acompanhamento" items={weeklyItems.length ? weeklyItems : [
                'Registrar estudos e questões realizadas.',
                'Atualizar pontos de dúvida para levar à próxima reunião.',
                'Avisar o time se algum bloqueio impedir a execução.',
              ]} />
            </div>
          </GuideSection>

          <GuideSection icon={Sparkles} title="Como este guia foi gerado">
            <div className="grid grid-cols-3 gap-3">
              <GenerationStep icon={FileText} title="Prontuário" text="Resumo, dificuldades, avanços, metas e próximos passos vêm do registro da reunião." />
              <GenerationStep icon={Sparkles} title="IA" text="A estrutura já está pronta para receber transcrição e gerar uma primeira versão automática." />
              <GenerationStep icon={Mail} title="Envio" text="O mentor revisa, exporta o PDF, copia a mensagem e registra o envio ao aluno." />
            </div>
          </GuideSection>

          {record?.next_meeting_referrals && (
            <GuideSection icon={CalendarDays} title="Próximo contato">
              <div className="rounded-2xl border-l-4 border-l-primary bg-[#FFF7F0] p-5">
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#55331F]">{record.next_meeting_referrals}</p>
              </div>
            </GuideSection>
          )}

          <div className="mt-10 rounded-3xl bg-[#FFF7F0] p-7">
            <p className="text-lg font-bold leading-relaxed text-[#55331F]">
              Organização e constância vencem semanas imperfeitas. Se algo sair do plano, a gente ajusta rápido e segue. Pode chamar sempre que precisar.
            </p>
            <p className="mt-5 text-sm font-semibold text-[#55331F]">{mentor.name} · Mentoria Residência</p>
          </div>
        </GuidePage>
      </article>
      </div>
    </div>
  )
}

function GuidePage({ children, footer }: { children: React.ReactNode; footer: string }) {
  return (
    <section className="student-guide-sheet relative overflow-hidden rounded-[14px] border border-border/60 bg-white px-10 py-9 shadow-sm">
      <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full border-[28px] border-primary/10" />
      <div className="relative z-10 min-h-[260mm]">{children}</div>
      <p className="absolute bottom-7 left-10 right-10 border-t border-border/40 pt-3 text-center text-[11px] text-muted-foreground">
        {footer}
      </p>
    </section>
  )
}

function GuideHeader({ kicker, rightTop, rightBottom }: { kicker: string; rightTop: string; rightBottom: string }) {
  return (
    <div className="flex items-start justify-between gap-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">{kicker}</p>
      <div className="text-right">
        <p className="text-sm font-bold text-foreground">{rightTop}</p>
        <p className="mt-1 text-xs text-muted-foreground">{rightBottom}</p>
      </div>
    </div>
  )
}

function IntroBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 space-y-4 rounded-3xl bg-[#FFF7F0] p-6 text-[15px] leading-relaxed text-[#55331F]">
      {children}
    </div>
  )
}

function GuideSection({ icon: Icon, title, children }: { icon: ReportIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="print-avoid mt-7">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-[21px] font-extrabold tracking-tight text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function TeamMember({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <p className="text-base font-bold text-foreground">{name}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{role}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

function PlatformItem({ icon: Icon, title, text }: { icon: ReportIcon; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border/60 p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function StepList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item} className="flex items-start gap-3 rounded-xl bg-muted/30 p-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{index + 1}</div>
          <p className="text-sm leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  )
}

function FlowBlock({ title, subtitle, items }: { title: string; subtitle: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <p className="text-base font-bold">{title}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{subtitle}</p>
      <ul className="mt-3 space-y-2">
        {items.map(item => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RoadmapCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-relaxed">{text}</p>
    </div>
  )
}

function QuestionBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold">{question}</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  )
}

function TipCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[#FFF7F0] p-4">
      <p className="text-sm font-bold text-[#55331F]">{title}</p>
      <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[#7A4A2B]">{text}</p>
    </div>
  )
}

function GoalCard({ value, label, sublabel }: { value: string; label: string; sublabel: string }) {
  return (
    <div className="rounded-2xl border border-border/60 p-5 text-center">
      <p className="text-3xl font-extrabold text-primary">{value}</p>
      <p className="mt-2 text-sm font-bold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
    </div>
  )
}

function WeeklyPlanTable({ rows }: { rows: Array<{ day: string; task: string; time: string; status: string }> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <table className="w-full text-sm">
        <thead className="bg-[#FFF7F0] text-[#55331F]">
          <tr>
            <th className="px-4 py-3 text-left font-bold">Dia</th>
            <th className="px-4 py-3 text-left font-bold">Tarefa</th>
            <th className="px-4 py-3 text-left font-bold">Tempo</th>
            <th className="px-4 py-3 text-left font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={`${row.day}-${row.task}`} className="border-t border-border/50">
              <td className="px-4 py-3 font-semibold">{row.day}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.task}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HighlightBox({ title, tone, text }: { title: string; tone: 'success' | 'warning'; text: string }) {
  return (
    <div className={cn('rounded-2xl border-l-4 p-5', tone === 'success' ? 'border-l-emerald-500 bg-emerald-50' : 'border-l-yellow-500 bg-yellow-50')}>
      <p className={cn('text-xs font-bold uppercase tracking-wide', tone === 'success' ? 'text-emerald-800' : 'text-yellow-800')}>{title}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{text}</p>
    </div>
  )
}

function PlanGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">{title}</p>
      <div className="mt-4 space-y-2">
        {items.map(item => (
          <div key={item} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p className="text-sm leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function GenerationStep({ icon: Icon, title, text }: { icon: ReportIcon; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

function splitLines(value?: string) {
  if (!value) return []
  return value
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[|•-]\s*/, '').trim())
    .filter(Boolean)
}

function getMeetingNumber(id: string) {
  const numeric = id.replace(/\D/g, '')
  return numeric ? numeric.padStart(2, '0') : '01'
}

function getReportVariant({
  meetingNumber,
  studentRisk,
  record,
}: {
  meetingNumber: string
  studentRisk: number
  record: ReturnType<typeof mockMedicalRecords.find>
}) {
  const hasSimulation = Boolean(record?.exams_and_simulations?.toLowerCase().includes('simulado'))

  if (hasSimulation) {
    return {
      label: 'Relatório pós-simulado',
      headline: 'esse guia organiza sua análise de desempenho e os ajustes para o próximo bloco.',
      intro: 'Preparei este material para transformar o resultado do simulado em decisões práticas: onde insistir, o que revisar e como organizar os próximos dias.',
    }
  }

  if (studentRisk >= 7) {
    return {
      label: 'Plano de recuperação',
      headline: 'esse documento é um plano claro para recuperar ritmo e reduzir risco.',
      intro: 'Preparei este guia para tirar peso da cabeça e transformar os pontos críticos em ações pequenas, acompanháveis e possíveis de executar.',
    }
  }

  if (meetingNumber === '01') {
    return {
      label: 'Primeira reunião',
      headline: 'esse documento é o seu ponto de partida para este ciclo.',
      intro: 'Preparei este guia para você ter tudo que conversamos em um lugar só: como usar a mentoria, quem é cada pessoa do seu time, como organizar os registros, qual é o fluxo de estudos e quais foram os combinados.',
    }
  }

  return {
    label: 'Reunião mensal',
    headline: 'esse guia consolida sua evolução, os ajustes e os combinados do mês.',
    intro: 'Preparei este material para organizar o que evoluiu, o que precisa de ajuste e quais ações vão guiar sua próxima etapa até a próxima reunião.',
  }
}

function buildDoubts(record: ReturnType<typeof mockMedicalRecords.find>) {
  const difficulties = record?.main_difficulties
  const nextSteps = record?.next_steps

  return [
    {
      question: 'Qual deve ser minha prioridade agora?',
      answer: nextSteps || 'Executar o plano semanal antes de abrir novas frentes. Primeiro consistência, depois aumento progressivo de volume.',
    },
    {
      question: 'O que eu faço quando errar muitas questões?',
      answer: 'Use o erro como mapa. Corrija com calma, registre o padrão do erro e volte ao material só para fechar a lacuna identificada.',
    },
    {
      question: 'Como lidar com os pontos que travaram?',
      answer: difficulties || 'Reduza a tarefa, retome pelo bloco mais simples e avise o time antes de deixar acumular.',
    },
  ]
}

function buildWeekPlan(record: ReturnType<typeof mockMedicalRecords.find>, prepCourse: string) {
  const nextSteps = splitLines(record?.next_steps)

  return {
    thisWeek: nextSteps.length ? nextSteps : [
      `Registrar os estudos do ${prepCourse} na plataforma da mentoria.`,
      'Fazer o primeiro bloco de questões dos temas combinados.',
      'Anotar erros e dúvidas para revisarmos no próximo contato.',
    ],
    nextCycle: [
      'Manter constância nos registros da plataforma.',
      'Ajustar volume de questões conforme desempenho da semana.',
      'Revisar os temas com maior dificuldade antes de avançar.',
    ],
  }
}

function buildWeeklySchedule({
  record,
  prepCourse,
}: {
  record: ReturnType<typeof mockMedicalRecords.find>
  prepCourse: string
}) {
  const nextSteps = splitLines(record?.next_steps)
  const topics = record?.priority_topics
    ?.split(',')
    .map(topic => topic.trim())
    .filter(Boolean) ?? []

  return [
    {
      day: 'Segunda',
      task: nextSteps[0] ?? `Registrar cronograma do ${prepCourse} e revisar prioridades da semana.`,
      time: '45-60min',
      status: 'Pendente',
    },
    {
      day: 'Terça',
      task: topics[0] ? `Questões dirigidas de ${topics[0]}.` : 'Bloco de questões do tema prioritário.',
      time: '1h30',
      status: 'Pendente',
    },
    {
      day: 'Quarta',
      task: topics[1] ? `Revisão ativa de ${topics[1]} + caderno de erros.` : 'Correção ativa e caderno de erros.',
      time: '1h',
      status: 'Pendente',
    },
    {
      day: 'Quinta',
      task: nextSteps[1] ?? 'Aula/teoria objetiva e registro na plataforma.',
      time: '2h',
      status: 'Pendente',
    },
    {
      day: 'Sexta',
      task: nextSteps[2] ?? 'Primeiro contato com questões dos temas da semana.',
      time: '1h30',
      status: 'Pendente',
    },
  ]
}

function getGoalMetric(goals: string[], keyword: string) {
  const goal = goals.find(item => item.toLowerCase().includes(keyword))
  if (!goal) return null
  const match = goal.match(/\d+%?|\d+h|\d+\+/i)
  return match?.[0] ?? null
}

function buildShareText({
  firstName,
  meeting,
  record,
}: {
  firstName: string
  meeting: NonNullable<ReturnType<typeof mockMeetings.find>>
  record: ReturnType<typeof mockMedicalRecords.find>
}) {
  const goals = splitLines(record?.goals)
  const nextSteps = splitLines(record?.next_steps)

  return [
    `Oi, ${firstName}! Segue seu guia pós-reunião.`,
    '',
    `Reunião: ${format(new Date(meeting.scheduled_at), 'dd/MM/yyyy', { locale: ptBR })}`,
    '',
    'Resumo:',
    record?.meeting_summary || 'Organizei os principais pontos conversados e os próximos passos da sua rotina de estudos.',
    '',
    'Metas:',
    ...(goals.length ? goals.map(item => `- ${item}`) : ['- Seguir o plano combinado para a semana.']),
    '',
    'Próximos passos:',
    ...(nextSteps.length ? nextSteps.map(item => `- ${item}`) : ['- Registrar os estudos e avisar se surgir algum bloqueio.']),
    '',
    record?.next_meeting_referrals ? `Para a próxima reunião:\n${record.next_meeting_referrals}` : '',
  ].filter(Boolean).join('\n')
}
