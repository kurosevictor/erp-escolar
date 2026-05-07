'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCPF, formatPhone, formatCurrency, getSituacaoColor, getSituacaoLabel } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Parcela {
  id: string
  numero: number
  valor: number
  vencimento: string
  pago: boolean
  dataPagamento: string | null
}

interface Aluno {
  id: string
  nome: string
  cpf: string
  email?: string
  telefone?: string
  foto?: string
  dataNascimento?: string
  dataMatricula: string
  situacaoMatricula: string
  observacoes?: string
  turma: { nome: string; curso: string; turno: string; horario: string }
  pagamentos: Parcela[]
  presencas: { id: string; presente: boolean }[]
}

export default function AlunoPage() {
  const params = useParams()
  const router = useRouter()
  const [aluno, setAluno] = useState<Aluno | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/alunos/${params.id}`)
      .then(r => r.json())
      .then(d => { setAluno(d); setLoading(false) })
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return
    setDeleting(true)
    await fetch(`/api/alunos/${params.id}`, { method: 'DELETE' })
    router.push('/alunos')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )

  if (!aluno) return <p className="text-red-500">Aluno não encontrado</p>

  const pagas = aluno.pagamentos.filter(p => p.pago).length
  const vencidas = aluno.pagamentos.filter(p => !p.pago && new Date(p.vencimento) < new Date()).length
  const totalParcelas = aluno.pagamentos.length
  const valorEmAberto = aluno.pagamentos
    .filter(p => !p.pago)
    .reduce((sum, p) => sum + p.valor, 0)
  const presentes = aluno.presencas.filter(p => p.presente).length
  const totalPresencas = aluno.presencas.length

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/alunos" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{aluno.nome}</h1>
          <p className="text-gray-500">Perfil do Aluno</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/alunos/${params.id}/editar`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Edit className="w-4 h-4" /> Editar
          </Link>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card lateral */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mb-4">
            {aluno.foto
              ? <img src={aluno.foto} alt={aluno.nome} className="w-full h-full object-cover" />
              : <span className="text-blue-600 font-bold text-4xl">{aluno.nome.charAt(0)}</span>}
          </div>
          <h2 className="font-bold text-gray-900 text-lg">{aluno.nome}</h2>
          <p className="text-blue-600 font-medium text-sm mt-1">{aluno.turma.curso}</p>
          <p className="text-gray-400 text-xs mt-0.5">{aluno.turma.nome}</p>
          <p className="text-gray-400 text-xs">{aluno.turma.turno} · {aluno.turma.horario}</p>
          <span className={`mt-3 text-xs px-2 py-0.5 rounded-full font-medium ${getSituacaoColor(aluno.situacaoMatricula)}`}>
            {getSituacaoLabel(aluno.situacaoMatricula)}
          </span>

          {totalPresencas > 0 && (
            <div className="mt-4 w-full bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Frequência</p>
              <p className="font-bold text-gray-900">{presentes}/{totalPresencas}</p>
              <p className="text-xs text-gray-400">{totalPresencas > 0 ? ((presentes / totalPresencas) * 100).toFixed(0) : 0}% de presença</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Dados pessoais */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">CPF</p>
                <p className="font-medium">{formatCPF(aluno.cpf)}</p>
              </div>
              {aluno.email && (
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{aluno.email}</p>
                </div>
              )}
              {aluno.telefone && (
                <div>
                  <p className="text-gray-500">Telefone</p>
                  <p className="font-medium">{formatPhone(aluno.telefone)}</p>
                </div>
              )}
              {aluno.dataNascimento && (
                <div>
                  <p className="text-gray-500">Nascimento</p>
                  <p className="font-medium">{format(new Date(aluno.dataNascimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Matrícula</p>
                <p className="font-medium">{format(new Date(aluno.dataMatricula), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
              {aluno.observacoes && (
                <div className="col-span-2">
                  <p className="text-gray-500">Observações</p>
                  <p className="font-medium">{aluno.observacoes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Parcelas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Financeiro</h3>
              <div className="flex gap-3 text-sm">
                <span className="text-green-600 font-medium">{pagas} pagas</span>
                {vencidas > 0 && <span className="text-red-600 font-medium">{vencidas} vencidas</span>}
                {valorEmAberto > 0 && <span className="text-gray-500">Em aberto: {formatCurrency(valorEmAberto)}</span>}
              </div>
            </div>

            {totalParcelas === 0 ? (
              <p className="text-gray-400 text-sm">Nenhuma parcela cadastrada.</p>
            ) : (
              <div className="space-y-2">
                {/* barra geral */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className={`h-2 rounded-full ${vencidas > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${(pagas / totalParcelas) * 100}%` }} />
                </div>
                {aluno.pagamentos.map(p => {
                  const vencida = !p.pago && new Date(p.vencimento) < new Date()
                  return (
                    <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                      p.pago ? 'bg-green-50' : vencida ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        {p.pago
                          ? <CheckCircle className="w-4 h-4 text-green-500" />
                          : vencida
                            ? <XCircle className="w-4 h-4 text-red-500" />
                            : <Clock className="w-4 h-4 text-gray-400" />}
                        <span className="font-medium">Parcela {p.numero}</span>
                        <span className="text-gray-500">{formatCurrency(p.valor)}</span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>Venc.: {format(new Date(p.vencimento), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        {p.dataPagamento && <p className="text-green-600">Pago: {format(new Date(p.dataPagamento), 'dd/MM/yyyy', { locale: ptBR })}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
