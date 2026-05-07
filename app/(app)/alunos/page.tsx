'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, List } from 'lucide-react'
import { formatCPF, getSituacaoColor, getSituacaoLabel } from '@/lib/utils'

interface Turma {
  id: string
  nome: string
  curso: string
  turno: string
}

interface Parcela {
  id: string
  pago: boolean
  vencimento: string
}

interface Aluno {
  id: string
  nome: string
  cpf: string
  foto: string | null
  situacaoMatricula: string
  diaVencimento: number | null
  valorMensalidade: number | null
  turma: Turma
  pagamentos: Parcela[]
}

const MATRICULAS = ['ATIVO', 'INATIVO', 'TRANCADO', 'FORMADO']

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ curso: '', turno: '', matricula: '' })
  const [sort, setSort] = useState('nome')

  // cursos e turnos únicos das turmas
  const cursos = [...new Set(turmas.map(t => t.curso))].sort()
  const turnos = [...new Set(turmas.map(t => t.turno))].sort()

  useEffect(() => {
    fetch('/api/turmas').then(r => r.json()).then(setTurmas).catch(() => {})
  }, [])

  const fetchAlunos = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20', search, sort })
    if (filters.curso) params.set('curso', filters.curso)
    if (filters.turno) params.set('turno', filters.turno)
    if (filters.matricula) params.set('matricula', filters.matricula)
    const r = await fetch(`/api/alunos?${params}`)
    const data = await r.json()
    setAlunos(data.alunos || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, search, filters, sort])

  useEffect(() => { fetchAlunos() }, [fetchAlunos])

  const totalPages = Math.ceil(total / 20)

  function getParcelaStatus(pagamentos: Parcela[]) {
    const total = pagamentos.length
    const pagas = pagamentos.filter(p => p.pago).length
    const vencidas = pagamentos.filter(p => !p.pago && new Date(p.vencimento) < new Date()).length
    return { total, pagas, vencidas }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-500 mt-1">{total} alunos encontrados</p>
        </div>
        <Link
          href="/alunos/novo"
          className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Aluno
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.curso}
            onChange={e => { setFilters(f => ({ ...f, curso: e.target.value })); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Cursos</option>
            {cursos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.turno}
            onChange={e => { setFilters(f => ({ ...f, turno: e.target.value })); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Turnos</option>
            {turnos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filters.matricula}
            onChange={e => { setFilters(f => ({ ...f, matricula: e.target.value })); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas Matrículas</option>
            {MATRICULAS.map(m => <option key={m} value={m}>{getSituacaoLabel(m)}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="nome">Ordenar: Nome</option>
            <option value="diaVencimento">Ordenar: Dia Vencimento</option>
            <option value="valor">Ordenar: Valor (maior)</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('cards')}
              className={`p-2 ${viewMode === 'cards' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : alunos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          Nenhum aluno encontrado.
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alunos.map(aluno => {
            const { total: tot, pagas, vencidas } = getParcelaStatus(aluno.pagamentos)
            const temInadimplencia = vencidas > 0
            return (
              <Link key={aluno.id} href={`/alunos/${aluno.id}`}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow block">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {aluno.foto
                      ? <img src={aluno.foto} alt={aluno.nome} className="w-full h-full object-cover" />
                      : <span className="text-blue-600 font-bold text-xl">{aluno.nome.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{aluno.nome}</h3>
                    <p className="text-sm text-gray-500">{aluno.turma.curso}</p>
                    <p className="text-xs text-gray-400">{aluno.turma.turno} · {aluno.turma.nome}</p>
                    <div className="flex gap-3 mt-1">
                      {aluno.diaVencimento && (
                        <span className="text-xs text-blue-600 font-medium">Vence dia {aluno.diaVencimento}</span>
                      )}
                      {aluno.valorMensalidade != null && aluno.valorMensalidade > 0 && (
                        <span className="text-xs text-gray-500">R$ {aluno.valorMensalidade.toFixed(2).replace('.', ',')}</span>
                      )}
                    </div>
                  </div>
                </div>
                {tot > 0 && (
                  <div className="mb-4 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Parcelas pagas</span>
                      <span>{pagas}/{tot}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${temInadimplencia ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${tot > 0 ? (pagas / tot) * 100 : 0}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSituacaoColor(aluno.situacaoMatricula)}`}>
                    {getSituacaoLabel(aluno.situacaoMatricula)}
                  </span>
                  {temInadimplencia && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
                      {vencidas} parcela{vencidas > 1 ? 's' : ''} vencida{vencidas > 1 ? 's' : ''}
                    </span>
                  )}
                  {tot > 0 && !temInadimplencia && pagas === tot && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">Quitado</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Aluno</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Turma</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Turno</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Matrícula</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Vencimento</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Mensalidade</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Financeiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alunos.map(aluno => {
                const { total: tot, pagas, vencidas } = getParcelaStatus(aluno.pagamentos)
                return (
                  <tr key={aluno.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/alunos/${aluno.id}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {aluno.foto
                            ? <img src={aluno.foto} alt={aluno.nome} className="w-8 h-8 rounded-full object-cover" />
                            : <span className="text-blue-600 text-xs font-bold">{aluno.nome.charAt(0)}</span>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{aluno.nome}</p>
                          <p className="text-xs text-gray-400">{formatCPF(aluno.cpf)}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{aluno.turma.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{aluno.turma.turno}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSituacaoColor(aluno.situacaoMatricula)}`}>
                        {getSituacaoLabel(aluno.situacaoMatricula)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                      {aluno.diaVencimento ? `Dia ${aluno.diaVencimento}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {aluno.valorMensalidade ? `R$ ${aluno.valorMensalidade.toFixed(2).replace('.', ',')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tot > 0 ? (
                        <span className={vencidas > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {pagas}/{tot} pagas
                          {vencidas > 0 ? ` · ${vencidas} venc.` : ''}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Anterior</button>
          <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50">Próximo</button>
        </div>
      )}
    </div>
  )
}
