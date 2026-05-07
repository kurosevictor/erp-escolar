import { Suspense } from 'react'
import {
  getKPIsFinanceiro,
  getReceitaMensal,
  getInadimplenciaFaixas,
  getReceitaPorCurso,
} from '@/server/actions/financeiro-dashboard.actions'
import { ReceitaMensalChart, InadimplenciaTable, ReceitaCursoChart } from './financeiro-charts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertCircle, DollarSign } from 'lucide-react'
import { SkeletonCards } from '@/components/shared/skeleton-cards'
import { SkeletonTable } from '@/components/shared/skeleton-table'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

async function DashboardContent({ mes, ano }: { mes: number; ano: number }) {
  const [kpis, receitaMensal, faixas, porCurso] = await Promise.all([
    getKPIsFinanceiro(mes, ano),
    getReceitaMensal(12),
    getInadimplenciaFaixas(),
    getReceitaPorCurso(),
  ])

  const kpiCards = [
    {
      label: 'Receita realizada',
      value: formatCurrency(kpis.receitaRealizada),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      sub: `de ${formatCurrency(kpis.receitaEsperada)} esperado`,
    },
    {
      label: 'Receita esperada',
      value: formatCurrency(kpis.receitaEsperada),
      icon: DollarSign,
      color: 'bg-blue-500',
      sub: `${MESES[mes - 1]}/${ano}`,
    },
    {
      label: 'Taxa de inadimplência',
      value: `${kpis.taxaInadimplencia}%`,
      icon: AlertCircle,
      color: 'bg-red-500',
      sub: 'alunos ativos com parcela vencida',
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(kpis.ticketMedio),
      icon: TrendingDown,
      color: 'bg-orange-500',
      sub: 'por aluno que pagou no mês',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
        <p className="text-muted-foreground mt-1">{MESES[mes - 1]} {ano}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-card border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      <ReceitaMensalChart data={receitaMensal} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InadimplenciaTable data={faixas} />
        <ReceitaCursoChart data={porCurso} />
      </div>
    </div>
  )
}

export default async function FinanceiroDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>
}) {
  const params = await searchParams
  const hoje = new Date()
  const mes = parseInt(params.mes ?? String(hoje.getMonth() + 1))
  const ano = parseInt(params.ano ?? String(hoje.getFullYear()))

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <SkeletonCards count={4} />
        <div className="h-72 bg-muted rounded-xl animate-pulse" />
        <SkeletonTable rows={4} columns={3} />
      </div>
    }>
      <DashboardContent mes={mes} ano={ano} />
    </Suspense>
  )
}
