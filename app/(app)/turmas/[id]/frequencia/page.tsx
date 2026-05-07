import { Suspense } from 'react'
import { getFrequenciaTurmaDetalhe } from '@/server/actions/frequencia.actions'
import type { StatusFrequencia } from '@/server/actions/frequencia.actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SkeletonTable } from '@/components/shared/skeleton-table'
import { FrequenciaChartClient, FrequenciaExportButton } from './frequencia-chart-client'

const STATUS_CONFIG: Record<StatusFrequencia, { label: string; icon: string; className: string }> = {
  OK:      { label: 'OK',      icon: '✓',  className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ATENCAO: { label: 'Atenção', icon: '⚠️', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  CRITICO: { label: 'Crítico', icon: '🔴', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

async function FrequenciaTurmaContent({
  turmaId, mes, ano,
}: { turmaId: string; mes: number; ano: number }) {
  const { turma, alunos, mediaGeral } = await getFrequenciaTurmaDetalhe(turmaId, mes, ano)
  const alunosEmRisco = alunos.filter((a) => a.status !== 'OK')

  const statusTurma: StatusFrequencia = mediaGeral >= 75 ? 'OK' : mediaGeral >= 50 ? 'ATENCAO' : 'CRITICO'
  const cfgTurma = STATUS_CONFIG[statusTurma]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/frequencia" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{turma.curso}</h1>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfgTurma.className}`}>
              {cfgTurma.label}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{MESES[mes - 1]} {ano} · Média geral: {mediaGeral}%</p>
        </div>
        <FrequenciaExportButton alunos={alunosEmRisco} turma={turma.nome} mes={mes} ano={ano} />
      </div>

      <FrequenciaChartClient alunos={alunos} />

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Aluno</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Presenças</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Faltas</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Frequência</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {alunos.map((a) => {
              const cfg = STATUS_CONFIG[a.status]
              return (
                <tr key={a.alunoId} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        {a.foto
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={a.foto} alt={a.nome} className="w-8 h-8 rounded-full object-cover" />
                          : <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">{a.nome.charAt(0)}</span>
                        }
                      </div>
                      <span className="font-medium text-sm">{a.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-emerald-600 font-medium">{a.presencas}</td>
                  <td className="px-4 py-3 text-center text-sm text-red-600 font-medium">{a.faltas}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${a.percentual < 50 ? 'text-red-600' : a.percentual < 75 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                      {a.percentual}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.className}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function FrequenciaTurmaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mes?: string; ano?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const hoje = new Date()
  const mes = parseInt(sp.mes ?? String(hoje.getMonth() + 1))
  const ano = parseInt(sp.ano ?? String(hoje.getFullYear()))

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <SkeletonTable rows={8} columns={5} />
      </div>
    }>
      <FrequenciaTurmaContent turmaId={id} mes={mes} ano={ano} />
    </Suspense>
  )
}
