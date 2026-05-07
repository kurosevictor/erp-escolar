'use client'
import { useEffect, useRef, useState } from 'react'
import { CheckSquare, Square, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { formatCPF } from '@/lib/utils'

interface Parcela {
  id: string
  valor: number
  nfEmitida: boolean
}

interface AlunoNF {
  id: string
  nome: string
  cpf: string
  cpfResponsavel: string | null
  foto: string | null
  anotacaoFinanceiro: string | null
  pagamentos: Parcela[]
}

export default function NotaFiscalPage() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [alunos, setAlunos] = useState<AlunoNF[]>([])
  const [cpfs, setCpfs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleString('pt-BR', { month: 'long' })

  function navMes(delta: number) {
    setMes(m => {
      const novoMes = m + delta
      if (novoMes < 1) { setAno(a => a - 1); return 12 }
      if (novoMes > 12) { setAno(a => a + 1); return 1 }
      return novoMes
    })
  }

  useEffect(() => {
    setLoading(true)
    fetch(`/api/nota-fiscal?mes=${mes}&ano=${ano}`)
      .then(r => r.json())
      .then((data: AlunoNF[]) => {
        setAlunos(data)
        const inicial: Record<string, string> = {}
        data.forEach(a => { inicial[a.id] = a.cpfResponsavel || a.cpf })
        setCpfs(inicial)
        setLoading(false)
      })
  }, [mes, ano])

  function salvarCpf(alunoId: string, valor: string) {
    setCpfs(prev => ({ ...prev, [alunoId]: valor }))
    clearTimeout(debounceRef.current[alunoId])
    debounceRef.current[alunoId] = setTimeout(() => {
      fetch(`/api/alunos/${alunoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpfResponsavel: valor || null }),
      })
    }, 600)
  }

  function toggleNF(aluno: AlunoNF) {
    const parcela = aluno.pagamentos[0]
    if (!parcela) return
    const novoValor = !parcela.nfEmitida
    setAlunos(prev => prev.map(a =>
      a.id === aluno.id
        ? { ...a, pagamentos: [{ ...parcela, nfEmitida: novoValor }] }
        : a
    ))
    fetch(`/api/mensalidades/${parcela.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfEmitida: novoValor }),
    })
  }

  const emitidas = alunos.filter(a => a.pagamentos[0]?.nfEmitida).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nota Fiscal</h1>
          <p className="text-gray-500 mt-1">Alunos com mensalidade paga — marque conforme emitir</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-4 py-2">
          <button onClick={() => navMes(-1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800 capitalize w-28 text-center">
            {nomeMes} {ano}
          </span>
          <button onClick={() => navMes(1)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Total pago no mês</p>
            <p className="text-xl font-bold text-gray-900">{alunos.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">NF emitidas</p>
            <p className="text-xl font-bold text-green-600">{emitidas} / {alunos.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : alunos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum aluno com pagamento confirmado em {nomeMes} {ano}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Aluno</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">CPF para NF</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Anotação</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">NF Emitida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alunos.map(aluno => {
                const emitida = aluno.pagamentos[0]?.nfEmitida ?? false
                return (
                  <tr key={aluno.id} className={`hover:bg-gray-50 transition-colors ${emitida ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {aluno.foto ? (
                          <img
                            src={aluno.foto}
                            alt={aluno.nome}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-600 text-xs font-bold">{aluno.nome.charAt(0)}</span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900 text-sm">{aluno.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={cpfs[aluno.id] || ''}
                        onChange={e => salvarCpf(aluno.id, e.target.value)}
                        className="w-36 text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 bg-gray-50 font-mono"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {aluno.anotacaoFinanceiro ? (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {aluno.anotacaoFinanceiro}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleNF(aluno)}
                        className={`transition-colors ${emitida ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                        title={emitida ? 'Marcar como não emitida' : 'Marcar como emitida'}
                      >
                        {emitida
                          ? <CheckSquare className="w-6 h-6" />
                          : <Square className="w-6 h-6" />
                        }
                      </button>
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
