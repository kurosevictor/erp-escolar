'use client'
import type { VagasTurma, StatusVaga } from '@/server/actions/vagas.actions'
import Link from 'next/link'
import { Users, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react'
import { ExportButton } from '@/components/shared/export-button'
import { exportToXlsx } from '@/lib/export/xlsx'

const STATUS_CONFIG: Record<StatusVaga, { label: string; className: string }> = {
  LOTADA:  { label: 'Lotada',  className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  CRITICA: { label: 'Crítica', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  ATENCAO: { label: 'Atenção', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  OK:      { label: 'OK',      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

function OcupacaoBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            pct >= 100 ? 'bg-destructive' :
            pct >= 80  ? 'bg-orange-500' :
            pct >= 60  ? 'bg-yellow-500' :
            'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-sm tabular-nums w-10 text-right">{pct}%</span>
    </div>
  )
}

export function VagasView({ turmas }: { turmas: VagasTurma[] }) {
  const totalTurmas = turmas.length
  const lotadas = turmas.filter((t) => t.status === 'LOTADA').length
  const totalLivres = turmas.reduce((s, t) => s + Math.max(0, t.vagasLivres), 0)
  const somaAlunos = turmas.reduce((s, t) => s + t.alunosAtivos, 0)
  const somaCapacidade = turmas.reduce((s, t) => s + t.capacidade, 0)
  const ocupacaoGeral = somaCapacidade > 0 ? Math.round((somaAlunos / somaCapacidade) * 100) : 0
  const turmasAtencao = turmas.filter((t) => t.status === 'LOTADA' || t.status === 'CRITICA')

  async function exportVagas() {
    await exportToXlsx(
      turmas as unknown as Record<string, unknown>[],
      [
        { header: 'Turma',        key: 'nome',            width: 35 },
        { header: 'Curso',        key: 'curso',           width: 25 },
        { header: 'Turno',        key: 'turno',           width: 20 },
        { header: 'Horário',      key: 'horario',         width: 18 },
        { header: 'Capacidade',   key: 'capacidade',      width: 12 },
        { header: 'Alunos',       key: 'alunosAtivos',    width: 10 },
        { header: 'Vagas Livres', key: 'vagasLivres',     width: 12 },
        { header: 'Ocupação %',   key: 'ocupacaoPercent', width: 12 },
        { header: 'Status',       key: 'status',          width: 10 },
      ],
      'vagas-turmas'
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vagas por Turma</h1>
          <p className="text-muted-foreground mt-1">{totalTurmas} turmas ativas</p>
        </div>
        <ExportButton onExport={exportVagas} label="Exportar XLSX" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-blue-500 p-2.5 rounded-lg"><BarChart2 className="w-5 h-5 text-white" /></div>
          <div><p className="text-2xl font-bold">{totalTurmas}</p><p className="text-sm text-muted-foreground">Total de turmas</p></div>
        </div>
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-red-500 p-2.5 rounded-lg"><AlertTriangle className="w-5 h-5 text-white" /></div>
          <div><p className="text-2xl font-bold text-red-600">{lotadas}</p><p className="text-sm text-muted-foreground">Turmas lotadas</p></div>
        </div>
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-emerald-500 p-2.5 rounded-lg"><Users className="w-5 h-5 text-white" /></div>
          <div><p className="text-2xl font-bold text-emerald-600">{totalLivres}</p><p className="text-sm text-muted-foreground">Vagas livres</p></div>
        </div>
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="bg-orange-500 p-2.5 rounded-lg"><CheckCircle className="w-5 h-5 text-white" /></div>
          <div><p className="text-2xl font-bold">{ocupacaoGeral}%</p><p className="text-sm text-muted-foreground">Ocupação geral</p></div>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Turma</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Turno</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Horário</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Alunos</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Cap.</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">Vagas</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground w-48">Ocupação</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {turmas.map((t) => {
              const cfg = STATUS_CONFIG[t.status]
              return (
                <tr key={t.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-foreground">{t.curso}</p>
                    <p className="text-xs text-muted-foreground">{t.nome}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{t.turno}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{t.horario}</td>
                  <td className="px-4 py-3 text-sm text-center font-medium">{t.alunosAtivos}</td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">{t.capacidade}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${t.vagasLivres <= 0 ? 'text-red-600' : t.vagasLivres <= 2 ? 'text-orange-600' : 'text-emerald-600'}`}>
                      {Math.max(0, t.vagasLivres)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><OcupacaoBar pct={t.ocupacaoPercent} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.className}`}>{cfg.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {turmasAtencao.length > 0 && (
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Turmas com atenção ({turmasAtencao.length})
          </h2>
          <div className="space-y-3">
            {turmasAtencao.map((t) => {
              const cfg = STATUS_CONFIG[t.status]
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{t.curso}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.turno} · {t.horario} · {Math.max(0, t.vagasLivres)} vaga{t.vagasLivres !== 1 ? 's' : ''} livre{t.vagasLivres !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${cfg.className}`}>{cfg.label}</span>
                    <Link href={`/alunos?turma=${t.id}`} className="text-xs text-primary hover:underline">
                      Ver alunos →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
