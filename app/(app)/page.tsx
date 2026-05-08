import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AlertCircle, Clock, Users, Cake, BarChart2, CheckCircle2, School, BookOpen } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { TarefasWidget } from '@/components/shared/tarefas-widget'
import { getVagasDashboard } from '@/server/actions/vagas.actions'
import { getAlunosEmRiscoCount } from '@/server/actions/frequencia.actions'

function saudacao(nome: string) {
  const h = new Date().getHours()
  const periodo = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  const now = new Date()
  return {
    texto: `${periodo}, ${nome.split(' ')[0]}`,
    data: `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`,
  }
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const { texto, data } = saudacao(user.nome)

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const mesAtual = new Date()
  const mesInicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
  const mesFim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0, 23, 59, 59)

  const hoje2 = new Date()
  const [
    vencendoHoje,
    vencidasEmAberto,
    inadimplentes,
    aniversariantes,
    ultimosAlunos,
    totalPago,
    totalAReceber,
    totalVencido,
    vagasData,
    alunosEmRiscoFreq,
  ] = await Promise.all([
    prisma.parcela.count({ where: { pago: false, vencimento: { gte: hoje, lt: amanha } } }),
    prisma.parcela.count({ where: { pago: false, vencimento: { lt: hoje } } }),
    prisma.aluno.count({ where: { pagamentos: { some: { pago: false, vencimento: { lt: hoje } } } } }),
    prisma.aluno.findMany({
      where: {
        dataNascimento: {
          not: null,
        },
      },
      select: { id: true, nome: true, dataNascimento: true, turma: { select: { nome: true } } },
    }).then((alunos: { id: string; nome: string; dataNascimento: Date | null; turma: { nome: string } | null }[]) =>
      alunos.filter((a) => {
        if (!a.dataNascimento) return false
        const dn = new Date(a.dataNascimento)
        return dn.getDate() === hoje.getDate() && dn.getMonth() === hoje.getMonth()
      })
    ),
    prisma.aluno.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, nome: true, turma: { select: { nome: true } }, createdAt: true, foto: true },
    }),
    prisma.parcela.aggregate({
      where: { pago: true, dataPagamento: { gte: mesInicio, lte: mesFim } },
      _sum: { valor: true },
    }),
    prisma.parcela.aggregate({
      where: { pago: false, vencimento: { gte: hoje } },
      _sum: { valor: true },
    }),
    prisma.parcela.aggregate({
      where: { pago: false, vencimento: { lt: hoje } },
      _sum: { valor: true },
    }),
    getVagasDashboard().catch(() => []),
    getAlunosEmRiscoCount(hoje2.getMonth() + 1, hoje2.getFullYear()).catch(() => 0),
  ])

  // Vagas widget data
  const top3Lotadas = [...vagasData]
    .sort((a, b) => b.ocupacaoPercent - a.ocupacaoPercent)
    .slice(0, 3)

  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const mesNome = meses[mesAtual.getMonth()]

  const cards = [
    {
      label: 'Vencendo hoje',
      value: vencendoHoje,
      icon: Clock,
      color: 'bg-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200',
      href: '/financeiro?filtro=vencendo-hoje',
    },
    {
      label: 'Vencidas em aberto',
      value: vencidasEmAberto,
      icon: AlertCircle,
      color: 'bg-red-500',
      bg: 'bg-red-50 dark:bg-red-950/20 border-red-200',
      href: '/financeiro?filtro=vencidas',
    },
    {
      label: 'Alunos inadimplentes',
      value: inadimplentes,
      icon: Users,
      color: 'bg-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200',
      href: '/financeiro?filtro=inadimplentes',
    },
    {
      label: 'Aniversariantes hoje',
      value: aniversariantes.length,
      icon: Cake,
      color: 'bg-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200',
      href: '/aniversarios',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{texto} 👋</h1>
          <p className="text-muted-foreground mt-1 capitalize">{data}</p>
        </div>
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg px-3 py-2 hover:bg-accent transition-colors"
        >
          <BarChart2 className="w-4 h-4" />
          Dashboard Analítico
        </Link>
      </div>

      {/* Cards de alerta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className={`rounded-xl border p-5 flex items-center gap-4 hover:shadow-sm transition-all ${card.bg}`}>
              <div className={`${card.color} p-2.5 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarefas */}
        <div className="lg:col-span-2">
          <TarefasWidget />
        </div>

        {/* Resumo financeiro */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">{mesNome} {mesAtual.getFullYear()}</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Pago
              </span>
              <span className="font-semibold text-green-600">{formatCurrency(totalPago._sum.valor ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> A receber
              </span>
              <span className="font-semibold text-blue-600">{formatCurrency(totalAReceber._sum.valor ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" /> Vencido
              </span>
              <span className="font-semibold text-red-600">{formatCurrency(totalVencido._sum.valor ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets: Vagas + Frequência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget Vagas */}
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <School className="w-4 h-4 text-blue-500" /> Ocupação das turmas
            </h2>
            <Link href="/vagas" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          <div className="space-y-3">
            {top3Lotadas.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.curso}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${t.ocupacaoPercent >= 100 ? 'bg-red-500' : t.ocupacaoPercent >= 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(t.ocupacaoPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{t.ocupacaoPercent}%</span>
                  </div>
                </div>
                {t.vagasLivres <= 0 && (
                  <span className="ml-3 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium shrink-0">Lotada</span>
                )}
              </div>
            ))}
            {top3Lotadas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma turma cadastrada</p>}
          </div>
        </div>

        {/* Widget Frequência */}
        <Link href="/frequencia" className={`bg-card rounded-xl border p-5 block hover:shadow-sm transition-shadow ${alunosEmRiscoFreq > 0 ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/10' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`${alunosEmRiscoFreq > 0 ? 'bg-orange-500' : 'bg-emerald-500'} p-3 rounded-lg`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{alunosEmRiscoFreq}</p>
              <p className="text-sm text-muted-foreground">Alunos em risco de frequência</p>
              <p className="text-xs text-muted-foreground mt-0.5">abaixo de 75% no mês atual</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Últimas matrículas */}
      <div className="bg-card rounded-xl border p-5">
        <h2 className="font-semibold text-foreground mb-4">Últimas Matrículas</h2>
        <div className="space-y-3">
          {ultimosAlunos.map((a) => (
            <Link key={a.id} href={`/alunos/${a.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                {a.foto
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={a.foto} alt={a.nome} className="w-9 h-9 rounded-full object-cover" />
                  : <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{a.nome.charAt(0)}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{a.nome}</p>
                <p className="text-xs text-muted-foreground">{a.turma?.nome}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                {new Date(a.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
