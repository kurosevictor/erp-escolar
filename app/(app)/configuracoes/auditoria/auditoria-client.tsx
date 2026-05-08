'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'

interface AuditLogEntry {
  id: string
  userId: string | null
  userEmail: string | null
  action: AuditAction
  entity: string
  entityId: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  ip: string | null
  userAgent: string | null
  createdAt: string
  user: { nome: string; email: string } | null
}

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  RESTORE: 'bg-yellow-100 text-yellow-700',
}

const ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE']

interface Filters {
  entity?: string
  action?: string
  userId?: string
  from?: string
  to?: string
}

export default function AuditoriaClient({
  logs,
  total,
  page,
  limit,
  entities,
  filters,
}: {
  logs: AuditLogEntry[]
  total: number
  page: number
  limit: number
  entities: string[]
  filters: Filters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [selected, setSelected] = useState<AuditLogEntry | null>(null)
  const [localFilters, setLocalFilters] = useState<Filters>(filters)
  const totalPages = Math.ceil(total / limit)

  function applyFilters() {
    const params = new URLSearchParams()
    params.set('page', '1')
    if (localFilters.entity) params.set('entity', localFilters.entity)
    if (localFilters.action) params.set('action', localFilters.action)
    if (localFilters.userId) params.set('userId', localFilters.userId)
    if (localFilters.from) params.set('from', localFilters.from)
    if (localFilters.to) params.set('to', localFilters.to)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    setLocalFilters({})
    router.push(pathname)
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Entidade</label>
          <select
            value={localFilters.entity || ''}
            onChange={(e) => setLocalFilters((f) => ({ ...f, entity: e.target.value || undefined }))}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {entities.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ação</label>
          <select
            value={localFilters.action || ''}
            onChange={(e) => setLocalFilters((f) => ({ ...f, action: e.target.value || undefined }))}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Data início</label>
          <input
            type="date"
            value={localFilters.from || ''}
            onChange={(e) => setLocalFilters((f) => ({ ...f, from: e.target.value || undefined }))}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Data fim</label>
          <input
            type="date"
            value={localFilters.to || ''}
            onChange={(e) => setLocalFilters((f) => ({ ...f, to: e.target.value || undefined }))}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="bg-[#1e3a5f] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-800"
          >
            Filtrar
          </button>
          <button
            onClick={clearFilters}
            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Limpar
          </button>
        </div>
        <span className="text-sm text-gray-500 ml-auto">{total} registros</span>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Data/Hora</th>
              <th className="px-4 py-3 text-left">Usuário</th>
              <th className="px-4 py-3 text-left">Ação</th>
              <th className="px-4 py-3 text-left">Entidade</th>
              <th className="px-4 py-3 text-left">ID do Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelected(log)}
              >
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {log.user?.nome || log.userEmail || 'Sistema'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action]}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{log.entity}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs truncate max-w-[160px]">
                  {log.entityId}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum registro encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalhe */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_COLORS[selected.action]}`}>
                  {selected.action}
                </span>
                <span className="font-medium text-gray-900">{selected.entity}</span>
                <span className="text-gray-400 text-sm font-mono">{selected.entityId}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Usuário:</span> {selected.user?.nome || selected.userEmail || 'Sistema'}</p>
                <p><span className="font-medium">Data:</span> {new Date(selected.createdAt).toLocaleString('pt-BR')}</p>
                {selected.ip && <p><span className="font-medium">IP:</span> {selected.ip}</p>}
              </div>
              {selected.before && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Antes</p>
                  <pre className="bg-red-50 text-red-800 text-xs p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selected.before, null, 2)}
                  </pre>
                </div>
              )}
              {selected.after && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Depois</p>
                  <pre className="bg-green-50 text-green-800 text-xs p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selected.after, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
