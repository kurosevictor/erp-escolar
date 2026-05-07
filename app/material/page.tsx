'use client'
import { useEffect, useRef, useState } from 'react'
import { CheckSquare, Square, Package, CheckCircle, XCircle } from 'lucide-react'
import { formatCPF } from '@/lib/utils'

interface AlunoMaterial {
  id: string
  nome: string
  cpf: string
  cpfResponsavel: string | null
  email: string | null
  foto: string | null
  materialPago: boolean
  materialEnviado: boolean
  turma: { curso: string }
}

export default function MaterialPage() {
  const [alunos, setAlunos] = useState<AlunoMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [cpfs, setCpfs] = useState<Record<string, string>>({})
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    fetch('/api/material')
      .then(r => r.json())
      .then((data: AlunoMaterial[]) => {
        setAlunos(data)
        const inicial: Record<string, string> = {}
        data.forEach(a => { inicial[a.id] = a.cpfResponsavel || a.cpf })
        setCpfs(inicial)
        setLoading(false)
      })
  }, [])

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

  function toggle(aluno: AlunoMaterial, campo: 'materialPago' | 'materialEnviado') {
    const novoValor = !aluno[campo]
    setAlunos(prev => prev.map(a => a.id === aluno.id ? { ...a, [campo]: novoValor } : a))
    fetch(`/api/alunos/${aluno.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [campo]: novoValor }),
    })
  }

  const pagos = alunos.filter(a => a.materialPago).length
  const enviados = alunos.filter(a => a.materialEnviado).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Material</h1>
        <p className="text-gray-500 mt-1">Controle de pagamento e envio de material didático</p>
      </div>

      <div className="flex gap-4">
        <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Total na lista</p>
            <p className="text-xl font-bold text-gray-900">{alunos.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Pagaram</p>
            <p className="text-xl font-bold text-green-600">{pagos} / {alunos.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-xs text-gray-500">Material enviado</p>
            <p className="text-xl font-bold text-purple-600">{enviados} / {alunos.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : alunos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum aluno na lista de material.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Aluno</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Curso</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Pagou?</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">CPF</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Material Enviado?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alunos.map(aluno => (
                <tr key={aluno.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {aluno.foto ? (
                        <img src={aluno.foto} alt={aluno.nome} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-blue-600 text-xs font-bold">{aluno.nome.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900 text-sm">{aluno.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{aluno.turma?.curso || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(aluno, 'materialPago')}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        aluno.materialPago
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {aluno.materialPago
                        ? <><CheckCircle className="w-3 h-3" /> Sim</>
                        : <><XCircle className="w-3 h-3" /> Não</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{aluno.email || '—'}</td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={cpfs[aluno.id] || ''}
                      onChange={e => salvarCpf(aluno.id, e.target.value)}
                      className="w-36 text-xs border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 bg-gray-50 font-mono"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(aluno, 'materialEnviado')}
                      className={`transition-colors ${
                        aluno.materialEnviado ? 'text-purple-500 hover:text-purple-600' : 'text-gray-300 hover:text-gray-400'
                      }`}
                      title={aluno.materialEnviado ? 'Marcar como não enviado' : 'Marcar como enviado'}
                    >
                      {aluno.materialEnviado
                        ? <CheckSquare className="w-6 h-6" />
                        : <Square className="w-6 h-6" />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
