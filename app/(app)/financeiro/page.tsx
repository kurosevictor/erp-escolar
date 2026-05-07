'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { DollarSign, TrendingDown, CheckCircle, Clock } from 'lucide-react'
import { formatCPF, formatCurrency } from '@/lib/utils'
import { ExportButton } from '@/components/shared/export-button'
import { exportToXlsx } from '@/lib/export/xlsx'

interface Parcela {
  id: string
  numero: number
  valor: number
  vencimento: string
  pago: boolean
}

interface Aluno {
  id: string
  nome: string
  cpf: string
  turma: { nome: string; curso: string }
  pagamentos: Parcela[]
  anotacaoFinanceiro: string | null
}

export default function FinanceiroPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [apenasInadimplentes, setApenasInadimplentes] = useState(false)
  const [anotacoes, setAnotacoes] = useState<Record<string, string>>({})
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (alunos.length === 0) return
    const inicial: Record<string, string> = {}
    alunos.forEach(a => { inicial[a.id] = a.anotacaoFinanceiro || '' })
    setAnotacoes(inicial)
  }, [alunos])

  function salvarAnotacao(alunoId: string, texto: string) {
    setAnotacoes(prev => ({ ...prev, [alunoId]: texto }))
    clearTimeout(debounceRef.current[alunoId])
    debounceRef.current[alunoId] = setTimeout(() => {
      fetch(`/api/alunos/${alunoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anotacaoFinanceiro: texto || null }),
      })
    }, 600)
  }

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '200' })
    if (apenasInadimplentes) params.set('inadimplente', '1')
    fetch(`/api/alunos?${params}`)
      .then(r => r.json())
      .then(d => { setAlunos(d.alunos || []); setLoading(false) })
  }, [apenasInadimplentes])

  const hoje = new Date()

  const alunosComInadimplencia = alunos.filter(a =>
    a.pagamentos.some(p => !p.pago && new Date(p.vencimento) < hoje)
  )

  const totalInadimplencia = alunos.reduce((sum, a) => {
    const vencidas = a.pagamentos.filter(p => !p.pago && new Date(p.vencimento) < hoje)
    return sum + vencidas.reduce((s, p) => s + p.valor, 0)
  }, 0)

  const totalPago = alunos.reduce((sum, a) =>
    sum + a.pagamentos.filter(p => p.pago).reduce((s, p) => s + p.valor, 0), 0)

  const totalAReceber = alunos.reduce((sum, a) =>
    sum + a.pagamentos.filter(p => !p.pago).reduce((s, p) => s + p.valor, 0), 0)

  async function exportFinanceiro() {
    type Row = { aluno: string; cpf: string; turma: string; numero: number; vencimento: string; valor: number; status: string; anotacao: string }
    const rows: Row[] = []
    for (const a of alunos) {
      for (const p of a.pagamentos) {
        rows.push({
          aluno: a.nome,
          cpf: formatCPF(a.cpf),
          turma: a.turma?.nome ?? '',
          numero: p.numero,
          vencimento: new Date(p.vencimento).toLocaleDateString('pt-BR'),
          valor: p.valor,
          status: p.pago ? 'Pago' : new Date(p.vencimento) < hoje ? 'Vencido' : 'Pendente',
          anotacao: anotacoes[a.id] ?? '',
        })
      }
    }
    await exportToXlsx(
      rows as unknown as Record<string, unknown>[],
      [
        { header: 'Aluno', key: 'aluno', width: 30 },
        { header: 'CPF', key: 'cpf', width: 16 },
        { header: 'Turma', key: 'turma', width: 20 },
        { header: 'Referência', key: 'numero', width: 12 },
        { header: 'Vencimento', key: 'vencimento', width: 14 },
        { header: 'Valor', key: 'valor', width: 12, formatter: (v) => Number(v).toFixed(2) },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Anotação', key: 'anotacao', width: 30 },
      ],
      'financeiro'
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 mt-1">Gestão de pagamentos e inadimplência</p>
        </div>
        <ExportButton onExport={exportFinanceiro} label="Exportar" disabled={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-green-500 p-3 rounded-lg">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pago</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">A Receber</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalAReceber)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Vencido em Aberto</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalInadimplencia)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Alunos Inadimplentes</p>
            <p className="text-2xl font-bold text-gray-900">{alunosComInadimplencia.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={apenasInadimplentes}
            onChange={e => setApenasInadimplentes(e.target.checked)}
            className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Apenas com parcelas vencidas</span>
        </label>
        <span className="text-sm text-gray-500">({alunos.length} alunos exibidos)</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Aluno</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Turma</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Pagas</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Vencidas</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Em Aberto</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Anotação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alunos.map(aluno => {
                const pagas = aluno.pagamentos.filter(p => p.pago).length
                const total = aluno.pagamentos.length
                const vencidas = aluno.pagamentos.filter(p => !p.pago && new Date(p.vencimento) < hoje)
                const emAberto = vencidas.reduce((s, p) => s + p.valor, 0)
                return (
                  <tr key={aluno.id} className={`hover:bg-gray-50 ${vencidas.length > 0 ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <Link href={`/alunos/${aluno.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">{aluno.nome.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm hover:text-blue-600">{aluno.nome}</p>
                          <p className="text-xs text-gray-400">{formatCPF(aluno.cpf)}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{aluno.turma?.nome || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{total > 0 ? `${pagas}/${total}` : '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      {vencidas.length > 0
                        ? <span className="text-red-600 font-medium">{vencidas.length} parcela{vencidas.length > 1 ? 's' : ''}</span>
                        : <span className="text-green-600">Em dia</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {emAberto > 0 ? <span className="text-red-600">{formatCurrency(emAberto)}</span> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={anotacoes[aluno.id] || ''}
                        onChange={e => salvarAnotacao(aluno.id, e.target.value)}
                        placeholder="Anotação..."
                        className="w-36 text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 bg-gray-50"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
