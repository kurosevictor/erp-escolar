'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { FrequenciaAluno } from '@/server/actions/frequencia.actions'
import { ExportButton } from '@/components/shared/export-button'
import { exportToXlsx } from '@/lib/export/xlsx'

export function FrequenciaChartClient({ alunos }: { alunos: FrequenciaAluno[] }) {
  const chartData = [
    { mes: 'Mês atual', media: alunos.length > 0 ? Math.round(alunos.reduce((s, a) => s + a.percentual, 0) / alunos.length) : 0 },
  ]

  return (
    <div className="bg-card border rounded-xl p-5">
      <h2 className="font-semibold text-foreground mb-4">Distribuição de frequência dos alunos</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v ?? 0}%`, 'Média']} />
          <Line dataKey="media" stroke="#3b82f6" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FrequenciaExportButton({
  alunos, turma, mes, ano,
}: { alunos: FrequenciaAluno[]; turma: string; mes: number; ano: number }) {
  const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  async function doExport() {
    await exportToXlsx(
      alunos as unknown as Record<string, unknown>[],
      [
        { header: 'Nome',         key: 'nome',       width: 30 },
        { header: 'Presenças',    key: 'presencas',  width: 12 },
        { header: 'Faltas',       key: 'faltas',     width: 10 },
        { header: 'Frequência %', key: 'percentual', width: 14 },
        { header: 'Status',       key: 'status',     width: 10 },
      ],
      `frequencia-${turma}-${MESES_NOME[mes - 1]}-${ano}`
    )
  }

  return <ExportButton onExport={doExport} label="Exportar em risco" />
}
