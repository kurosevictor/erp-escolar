'use client'
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import type { ReceitaMensal, InadimplenciaFaixa, ReceitaCurso } from '@/server/actions/financeiro-dashboard.actions'
import { formatCurrency } from '@/lib/utils'
import { ExportButton } from '@/components/shared/export-button'
import { exportToXlsx } from '@/lib/export/xlsx'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']

function formatR(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function ReceitaMensalChart({ data }: { data: ReceitaMensal[] }) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <h2 className="font-semibold text-foreground mb-4">Receita mensal — últimos 12 meses</h2>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="mesAno" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatR} tick={{ fontSize: 11 }} width={80} />
          <Tooltip
            formatter={(v, name) => [
              formatCurrency(Number(v ?? 0)),
              name === 'receitaRealizada' ? 'Realizada' : 'Esperada',
            ]}
          />
          <Legend formatter={(v) => v === 'receitaRealizada' ? 'Realizada' : 'Esperada'} />
          <Bar dataKey="receitaRealizada" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Line dataKey="receitaEsperada" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function InadimplenciaTable({ data }: { data: InadimplenciaFaixa[] }) {
  async function exportInadimplencia() {
    await exportToXlsx(
      data as unknown as Record<string, unknown>[],
      [
        { header: 'Faixa',            key: 'faixa',          width: 20 },
        { header: 'Alunos',           key: 'alunos',         width: 10 },
        { header: 'Valor em Aberto',  key: 'valorEmAberto',  width: 18, formatter: (v) => Number(v).toFixed(2) },
      ],
      'inadimplencia-faixas'
    )
  }

  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Inadimplência por faixa de atraso</h2>
        <ExportButton onExport={exportInadimplencia} label="Exportar" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 text-sm font-semibold text-muted-foreground">Faixa</th>
            <th className="text-center py-2 text-sm font-semibold text-muted-foreground">Alunos</th>
            <th className="text-right py-2 text-sm font-semibold text-muted-foreground">Valor em aberto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((f) => (
            <tr key={f.faixa} className="hover:bg-accent/50 transition-colors">
              <td className="py-3 text-sm font-medium">{f.faixa}</td>
              <td className="py-3 text-center text-sm">{f.alunos}</td>
              <td className="py-3 text-right text-sm font-semibold text-red-600">{formatCurrency(f.valorEmAberto)}</td>
            </tr>
          ))}
          <tr className="border-t-2 bg-muted/30">
            <td className="py-3 text-sm font-bold">Total</td>
            <td className="py-3 text-center text-sm font-bold">{data.reduce((s, f) => s + f.alunos, 0)}</td>
            <td className="py-3 text-right text-sm font-bold text-red-600">{formatCurrency(data.reduce((s, f) => s + f.valorEmAberto, 0))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function ReceitaCursoChart({ data }: { data: ReceitaCurso[] }) {
  const total = data.reduce((s, d) => s + d.valor, 0)
  return (
    <div className="bg-card border rounded-xl p-5">
      <h2 className="font-semibold text-foreground mb-4">Receita por curso</h2>
      <div className="flex gap-6">
        <ResponsiveContainer width="50%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="valor" nameKey="curso" cx="50%" cy="50%" outerRadius={90}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v, name) => [formatCurrency(Number(v ?? 0)), name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2 overflow-y-auto max-h-56">
          {data.map((d, i) => (
            <div key={d.curso} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate text-foreground">{d.curso}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-medium">{formatCurrency(d.valor)}</p>
                <p className="text-xs text-muted-foreground">{total > 0 ? Math.round((d.valor / total) * 100) : 0}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
