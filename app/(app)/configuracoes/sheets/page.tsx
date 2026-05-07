'use client'
import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Trash2, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Config {
  id: string
  turno: string
  curso: string
  sheetId: string
  nomeAba: string
  ativo: boolean
}

interface SyncResult {
  atualizados: number
  naoEncontrados: string[]
  erros: string[]
}

const CURSOS = ['Administração', 'Contabilidade', 'Informática', 'Enfermagem']

export default function ConfiguracoesSheetsPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [ultimaSinc, setUltimaSinc] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)

  const [form, setForm] = useState({
    turno: 'MANHA',
    curso: 'Administração',
    sheetId: '',
    nomeAba: '',
    ativo: true,
  })

  const fetchData = async () => {
    const [cfgRes, statusRes] = await Promise.all([
      fetch('/api/configuracoes/sheets'),
      fetch('/api/sync/status'),
    ])
    const cfgs = await cfgRes.json()
    const status = await statusRes.json()
    setConfigs(cfgs)
    setUltimaSinc(status.ultimaSincronizacao)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    const res = await fetch('/api/sync/sheets', { method: 'POST' })
    const result = await res.json()
    setSyncResult(result)
    setSyncing(false)
    fetchData()
  }

  const handleSave = async () => {
    const payload = editingConfig ? { ...form, id: editingConfig.id } : form
    await fetch('/api/configuracoes/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowForm(false)
    setEditingConfig(null)
    setForm({ turno: 'MANHA', curso: 'Administração', sheetId: '', nomeAba: '', ativo: true })
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta configuração?')) return
    await fetch('/api/configuracoes/sheets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  const handleEdit = (config: Config) => {
    setEditingConfig(config)
    setForm({ turno: config.turno, curso: config.curso, sheetId: config.sheetId, nomeAba: config.nomeAba, ativo: config.ativo })
    setShowForm(true)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração de Planilhas</h1>
          <p className="text-gray-500 mt-1">Gerencie a integração com Google Sheets</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingConfig(null) }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-blue-800"
          >
            <Plus className="w-4 h-4" />
            Nova Planilha
          </button>
        </div>
      </div>

      {ultimaSinc && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          Última sincronização: {format(new Date(ultimaSinc), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      )}

      {syncing && (
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="text-gray-600">Sincronizando dados com Google Sheets...</p>
        </div>
      )}

      {syncResult && !syncing && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Resultado da Sincronização</h3>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>{syncResult.atualizados} alunos atualizados com sucesso</span>
          </div>
          {syncResult.naoEncontrados.length > 0 && (
            <div>
              <p className="text-amber-600 font-medium text-sm">Não encontrados no banco ({syncResult.naoEncontrados.length}):</p>
              <ul className="text-sm text-amber-600 list-disc list-inside">
                {syncResult.naoEncontrados.map((nome, i) => <li key={i}>{nome}</li>)}
              </ul>
            </div>
          )}
          {syncResult.erros.length > 0 && (
            <div>
              <p className="text-red-600 font-medium text-sm">Erros:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {syncResult.erros.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingConfig ? 'Editar Planilha' : 'Nova Planilha'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
              <select value={form.turno} onChange={e => setForm(f => ({ ...f, turno: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
                <option value="NOITE">Noite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select value={form.curso} onChange={e => setForm(f => ({ ...f, curso: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CURSOS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Planilha Google</label>
              <input value={form.sheetId} onChange={e => setForm(f => ({ ...f, sheetId: e.target.value }))}
                placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1">Encontrado na URL: docs.google.com/spreadsheets/d/<strong>ID</strong>/edit</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Aba</label>
              <input value={form.nomeAba} onChange={e => setForm(f => ({ ...f, nomeAba: e.target.value }))}
                placeholder="Ex: Turma Manhã"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                className="w-4 h-4 text-blue-600" />
              <label htmlFor="ativo" className="text-sm font-medium text-gray-700">Ativo</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave}
              className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-blue-800 text-sm">
              Salvar
            </button>
            <button onClick={() => { setShowForm(false); setEditingConfig(null) }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {configs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              Nenhuma planilha configurada. Adicione uma acima.
            </div>
          ) : (
            configs.map(config => (
              <div key={config.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.ativo ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <h3 className="font-semibold text-gray-900">{config.nomeAba}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {config.curso} • {config.turno === 'MANHA' ? 'Manhã' : config.turno === 'TARDE' ? 'Tarde' : 'Noite'}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate max-w-sm">{config.sheetId}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(config)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(config.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
