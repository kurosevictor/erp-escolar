'use client'
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Loader2, RefreshCw, PlusCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ExportButton } from '@/components/shared/export-button'
import { exportToXlsx } from '@/lib/export/xlsx'

interface Mensalidade {
  id: string
  alunoId: string
  vencimento: string
  pago: boolean
  numero: number
  valor: number
}

interface AlunoMap {
  [id: string]: { nome: string; foto?: string }
}

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export default function MensalidadesPage() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([])
  const [alunos, setAlunos] = useState<AlunoMap>({})
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [gerando, setGerando] = useState(false)
  const [valor, setValor] = useState('0')
  const [feedback, setFeedback] = useState<string | null>(null)

  const mesStr = `${ano}-${String(mes).padStart(2, '0')}`

  const carregar = useCallback(async () => {
    setLoading(true)
    const [mRes, aRes] = await Promise.all([
      fetch(`/api/mensalidades?mes=${mesStr}`).then(r => r.json()),
      fetch('/api/alunos?limit=300').then(r => r.json()),
    ])
    setMensalidades(Array.isArray(mRes) ? mRes : [])
    const map: AlunoMap = {}
    for (const a of aRes.alunos || []) map[a.id] = { nome: a.nome, foto: a.foto }
    setAlunos(map)
    setLoading(false)
  }, [mesStr])

  useEffect(() => { carregar() }, [carregar])

  const togglePago = async (m: Mensalidade) => {
    setToggling(m.id)
    await fetch(`/api/mensalidades/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pago: !m.pago }),
    })
    setMensalidades(prev => prev.map(x => x.id === m.id ? { ...x, pago: !x.pago } : x))
    setToggling(null)
  }

  const gerarMensalidades = async () => {
    setGerando(true)
    setFeedback(null)
    const res = await fetch('/api/mensalidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes: mesStr, valor: parseFloat(valor) || 0 }),
    }).then(r => r.json())
    setGerando(false)
    if (res.error) { setFeedback(`Erro: ${res.error}`); return }
    setFeedback(res.criadas > 0
      ? `✅ ${res.criadas} mensalidade(s) criadas${res.puladas ? ` (${res.puladas} já existiam)` : ''}`
      : res.mensagem || 'Nenhuma nova mensalidade criada.')
    await carregar()
  }

  const pagas = mensalidades.filter(m => m.pago).length
  const pendentes = mensalidades.length - pagas

  async function exportMensalidades() {
    type Row = { aluno: string; vencimento: string; valor: string; status: string }
    const rows: Row[] = mensalidades.map(m => ({
      aluno: alunos[m.alunoId]?.nome ?? m.alunoId,
      vencimento: format(new Date(m.vencimento), 'dd/MM/yyyy', { locale: ptBR }),
      valor: m.valor > 0 ? m.valor.toFixed(2) : '0,00',
      status: m.pago ? 'Paga' : 'Pendente',
    }))
    await exportToXlsx(
      rows as unknown as Record<string, unknown>[],
      [
        { header: 'Aluno', key: 'aluno', width: 30 },
        { header: 'Referência', key: 'referencia', width: 14, formatter: () => `${MESES[mes - 1]}/${ano}` },
        { header: 'Vencimento', key: 'vencimento', width: 14 },
        { header: 'Valor (R$)', key: 'valor', width: 14 },
        { header: 'Status', key: 'status', width: 12 },
      ],
      `mensalidades-${mesStr}`
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensalidades</h1>
          <p className="text-gray-500 mt-1">Gerencie e acompanhe os pagamentos mensais</p>
        </div>
        <ExportButton onExport={exportMensalidades} label="Exportar" disabled={loading || mensalidades.length === 0} />
      </div>

      {/* Seletor de mês + gerar */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Mês</label>
          <select value={mes} onChange={e => setMes(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {MESES.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Ano</label>
          <input type="number" value={ano} onChange={e => setAno(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1">Valor (R$)</label>
          <input type="number" value={valor} onChange={e => setValor(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={gerarMensalidades} disabled={gerando}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
          {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          Gerar mensalidades
        </button>
        <button onClick={carregar} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
        {feedback && <p className="text-sm text-gray-700">{feedback}</p>}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{mensalidades.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{pagas}</p>
          <p className="text-sm text-gray-500">Pagas</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{pendentes}</p>
          <p className="text-sm text-gray-500">Pendentes</p>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : mensalidades.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          <p className="font-medium">Nenhuma mensalidade para {MESES[mes - 1]} {ano}</p>
          <p className="text-sm mt-1">Clique em "Gerar mensalidades" para criar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Aluno</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Vencimento</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Valor</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mensalidades.map(m => {
                const aluno = alunos[m.alunoId]
                return (
                  <tr key={m.id} className={`hover:bg-gray-50 ${m.pago ? 'bg-green-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {aluno?.foto
                            ? <img src={aluno.foto} alt="" className="w-full h-full object-cover" />
                            : <span className="text-blue-600 text-xs font-bold">{aluno?.nome?.charAt(0) ?? '?'}</span>}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{aluno?.nome ?? m.alunoId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(m.vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {m.valor > 0 ? `R$ ${m.valor.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {m.pago
                        ? <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" />Paga</span>
                        : <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><XCircle className="w-4 h-4" />Pendente</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePago(m)}
                        disabled={toggling === m.id}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          m.pago
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}>
                        {toggling === m.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : m.pago ? 'Desmarcar' : 'Marcar pago'}
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
