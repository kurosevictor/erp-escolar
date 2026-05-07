import { Suspense } from 'react'
import { getFrequenciaGeral } from '@/server/actions/frequencia.actions'
import type { FrequenciaTurma, StatusFrequencia } from '@/server/actions/frequencia.actions'
import Link from 'next/link'
import { SkeletonTable } from '@/components/shared/skeleton-table'

const STATUS_CONFIG: Record<StatusFrequencia, { label: string; className: string }> = {
  OK:      { label: 'OK',      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ATENCAO: { label: 'Atenção', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  CRITICO: { label: 'Crítico', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

async function FrequenciaGeralContent({ mes, ano }: { mes: number; ano: number }) {
  const turmas = await getFrequenciaGeral(mes, ano)

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Frequência das Turmas</h1>
          <p className="text-muted-foreground mt-1">{MESES[mes - 1]} {ano} · {turmas.length} turmas</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Turma</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Turno</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Horário</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Chamadas</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Média %</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Em risco</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {turmas.map((t) => {
              const cfg = STATUS_CONFIG[t.status]
              return (
                <tr key={t.turmaId} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-foreground">{t.curso}</p>
                    <p className="text-xs text-muted-foreground">{t.nome}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{t.turno}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{t.horario}</td>
                  <td className="px-4 py-3 text-center text-sm">{t.totalChamadas}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${t.mediaPresenca < 50 ? 'text-red-600' : t.mediaPresenca < 75 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                      {t.mediaPresenca}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {t.alunosEmRisco > 0
                      ? <span className="text-red-600 font-medium">{t.alunosEmRisco}</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.className}`}>{cfg.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/turmas/${t.turmaId}/frequencia?mes=${mes}&ano=${ano}`} className="text-xs text-primary hover:underline">
                      Ver detalhes →
                    </Link>
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

export default async function FrequenciaPage({
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
        <SkeletonTable rows={8} columns={8} />
      </div>
    }>
      <FrequenciaGeralContent mes={mes} ano={ano} />
    </Suspense>
  )
}
