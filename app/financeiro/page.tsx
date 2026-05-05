'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DollarSign, TrendingDown } from 'lucide-react'
import { formatCPF, formatCurrency } from '@/lib/utils'

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
}

export default function FinanceiroPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [apenasInadimplentes, setApenasInadimplentes] = useState(false)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 mt-1">Gestão de pagamentos e inadimplência</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total em Aberto (vencido)</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalInadimplencia)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Alunos com Parcelas Vencidas</p>
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
