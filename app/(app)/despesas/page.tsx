'use client'
import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, Wallet, RefreshCw, Plus, Trash2 } from 'lucide-react'

interface Despesa {
  id: string
  nome: string
  valor: number
  diaVencimento: number
  pago: boolean
}

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [totalMensalidadesPagas, setTotalMensalidadesPagas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [novaForm, setNovaForm] = useState(false)
  const [novaDespesa, setNovaDespesa] = useState({ nome: '', valor: '', diaVencimento: '' })
  const valorRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  async function load() {
    setLoading(true)
    const res = await fetch('/api/despesas')
    const data = await res.json()
    setDespesas(data.despesas)
    setTotalMensalidadesPagas(data.totalMensalidadesPagas)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePago(id: string, pago: boolean) {
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, pago } : d))
    await fetch(`/api/despesas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pago }),
    })
  }

  function onValorChange(id: string, raw: string) {
    const num = parseFloat(raw.replace(',', '.'))
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, valor: isNaN(num) ? 0 : num } : d))
    clearTimeout(valorRefs.current[id])
    valorRefs.current[id] = setTimeout(async () => {
      await fetch(`/api/despesas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: isNaN(num) ? 0 : num }),
      })
    }, 700)
  }

  async function novoMes() {
    if (!confirm('Desmarcar todas as despesas como não pagas?')) return
    await Promise.all(despesas.map(d =>
      fetch(`/api/despesas/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: false }),
      })
    ))
    setDespesas(prev => prev.map(d => ({ ...d, pago: false })))
  }

  async function deletar(id: string) {
    if (!confirm('Remover essa despesa?')) return
    setDespesas(prev => prev.filter(d => d.id !== id))
    await fetch(`/api/despesas/${id}`, { method: 'DELETE' })
  }

  async function criarDespesa() {
    const valor = parseFloat(novaDespesa.valor.replace(',', '.')) || 0
    const diaVencimento = parseInt(novaDespesa.diaVencimento)
    if (!novaDespesa.nome || !diaVencimento) return
    const res = await fetch('/api/despesas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novaDespesa.nome, valor, diaVencimento }),
    })
    const criada = await res.json()
    setDespesas(prev => [...prev, criada].sort((a, b) => a.diaVencimento - b.diaVencimento))
    setNovaDespesa({ nome: '', valor: '', diaVencimento: '' })
    setNovaForm(false)
  }

  const totalDespesasPagas = despesas.filter(d => d.pago).reduce((s, d) => s + d.valor, 0)
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0)
  const caixa = totalMensalidadesPagas - totalDespesasPagas

  const grupos = despesas.reduce<Record<number, Despesa[]>>((acc, d) => {
    if (!acc[d.diaVencimento]) acc[d.diaVencimento] = []
    acc[d.diaVencimento].push(d)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-500 mt-1">Controle mensal de gastos fixos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setNovaForm(v => !v)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
          <button
            onClick={novoMes}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Novo Mês
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Mensalidades Pagas</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalMensalidadesPagas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Despesas Pagas</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totalDespesasPagas)}</p>
            <p className="text-xs text-gray-400">Total previsto: {formatCurrency(totalDespesas)}</p>
          </div>
        </div>
        <div className={`rounded-xl shadow-sm p-5 flex items-center gap-4 ${caixa >= 0 ? 'bg-blue-600' : 'bg-red-600'}`}>
          <div className="bg-white/20 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-white/80">Caixa</p>
            <p className="text-xl font-bold text-white">{formatCurrency(caixa)}</p>
            <p className="text-xs text-white/70">Mensalidades pagas − despesas pagas</p>
          </div>
        </div>
      </div>

      {/* Formulário nova despesa */}
      {novaForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 block mb-1">Nome</label>
            <input
              value={novaDespesa.nome}
              onChange={e => setNovaDespesa(v => ({ ...v, nome: e.target.value }))}
              placeholder="Ex: Aluguel"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-36">
            <label className="text-xs font-medium text-gray-600 block mb-1">Valor (R$)</label>
            <input
              value={novaDespesa.valor}
              onChange={e => setNovaDespesa(v => ({ ...v, valor: e.target.value }))}
              placeholder="0,00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-gray-600 block mb-1">Vencimento (dia)</label>
            <input
              value={novaDespesa.diaVencimento}
              onChange={e => setNovaDespesa(v => ({ ...v, diaVencimento: e.target.value }))}
              placeholder="10"
              type="number"
              min="1"
              max="31"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={criarDespesa} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Salvar
          </button>
          <button onClick={() => setNovaForm(false)} className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm">
            Cancelar
          </button>
        </div>
      )}

      {/* Grupos por dia de vencimento */}
      <div className="space-y-4">
        {Object.entries(grupos)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([dia, items]) => {
            const totalGrupo = items.reduce((s, d) => s + d.valor, 0)
            const pagoGrupo = items.filter(d => d.pago).reduce((s, d) => s + d.valor, 0)
            const todosPageos = items.every(d => d.pago)

            return (
              <div key={dia} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Cabeçalho do grupo */}
                <div className={`px-5 py-3 flex items-center justify-between border-b ${todosPageos ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center ${todosPageos ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                      {dia}
                    </span>
                    <span className="font-semibold text-gray-700 text-sm">Vencimento dia {dia}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Precisa ter em caixa</p>
                    <p className={`font-bold text-base ${todosPageos ? 'text-green-600' : 'text-gray-900'}`}>
                      {formatCurrency(totalGrupo)}
                    </p>
                    {pagoGrupo > 0 && pagoGrupo < totalGrupo && (
                      <p className="text-xs text-gray-400">Pago: {formatCurrency(pagoGrupo)} • Falta: {formatCurrency(totalGrupo - pagoGrupo)}</p>
                    )}
                  </div>
                </div>

                {/* Linhas de despesas */}
                <div className="divide-y divide-gray-50">
                  {items.map(d => (
                    <div key={d.id} className={`flex items-center px-5 py-3 gap-4 group ${d.pago ? 'bg-green-50/40' : ''}`}>
                      <input
                        type="checkbox"
                        checked={d.pago}
                        onChange={e => togglePago(d.id, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-pointer accent-green-500 shrink-0"
                      />
                      <span className={`flex-1 text-sm font-medium ${d.pago ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {d.nome}
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-400 text-xs">R$</span>
                        <input
                          type="text"
                          defaultValue={d.valor.toFixed(2).replace('.', ',')}
                          key={d.id}
                          onBlur={e => onValorChange(d.id, e.target.value)}
                          className={`w-28 text-right border border-transparent hover:border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 rounded px-2 py-1 font-semibold focus:outline-none bg-transparent ${d.pago ? 'text-gray-400' : 'text-gray-900'}`}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-center">dia {d.diaVencimento}</span>
                      <button
                        onClick={() => deletar(d.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {/* Caixa total fixo no fim */}
      <div className={`rounded-xl p-6 flex items-center justify-between ${caixa >= 0 ? 'bg-blue-600' : 'bg-red-600'}`}>
        <div>
          <p className="text-white/80 text-sm font-medium">Caixa do mês</p>
          <p className="text-white text-xs mt-0.5">Entradas (mensalidades pagas) − Saídas (despesas pagas)</p>
        </div>
        <div className="text-right">
          <p className="text-white text-3xl font-bold">{formatCurrency(caixa)}</p>
          <p className="text-white/70 text-xs mt-1">
            {formatCurrency(totalMensalidadesPagas)} − {formatCurrency(totalDespesasPagas)}
          </p>
        </div>
      </div>
    </div>
  )
}
