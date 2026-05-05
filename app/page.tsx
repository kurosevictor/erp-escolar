'use client'
import { useEffect, useState } from 'react'
import { Users, AlertCircle, CheckCircle, BookOpen } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import Link from 'next/link'
import { formatCurrency, getSituacaoColor, getSituacaoLabel } from '@/lib/utils'

interface DashboardData {
  totalAlunos: number
  inadimplentes: number
  alunosAtivos: number
  totalCursos: number
  porCurso: { curso: string; total: number }[]
  porPagamento: { situacao: string; total: number }[]
  recentes: {
    id: string
    nome: string
    curso: string
    turno: string
    foto: string | null
    situacaoPagamento: string
  }[]
}

const COLORS = ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
const PAG_COLORS: Record<string, string> = {
  EM_DIA: '#22c55e',
  INADIMPLENTE: '#ef4444',
  ISENTO: '#3b82f6',
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!data) return <p className="text-red-500">Erro ao carregar dados</p>

  const cards = [
    { label: 'Total de Alunos', value: data.totalAlunos, icon: Users, color: 'bg-blue-600' },
    { label: 'Inadimplentes', value: data.inadimplentes, icon: AlertCircle, color: 'bg-red-500' },
    { label: 'Alunos Ativos', value: data.alunosAtivos, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Total de Cursos', value: data.totalCursos, icon: BookOpen, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Curso</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.porCurso}
                dataKey="total"
                nameKey="curso"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {data.porCurso.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Situação de Pagamento</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.porPagamento}>
              <XAxis dataKey="situacao" tickFormatter={(v: string) => getSituacaoLabel(v)} />
              <YAxis />
              <Tooltip labelFormatter={(label) => getSituacaoLabel(String(label))} />
              <Bar dataKey="total" name="Alunos" radius={[4, 4, 0, 0]}>
                {data.porPagamento.map((entry, i) => (
                  <Cell key={i} fill={PAG_COLORS[entry.situacao] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Alunos Recentes</h2>
        <div className="space-y-3">
          {data.recentes.map((aluno) => (
            <Link
              key={aluno.id}
              href={`/alunos/${aluno.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {aluno.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={aluno.foto} alt={aluno.nome} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-blue-600 font-semibold text-sm">
                    {aluno.nome.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{aluno.nome}</p>
                <p className="text-sm text-gray-500">{aluno.curso} • {getSituacaoLabel(aluno.turno)}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSituacaoColor(aluno.situacaoPagamento)}`}>
                {getSituacaoLabel(aluno.situacaoPagamento)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
