'use client'
import { useState } from 'react'
type UserRole = 'ADMIN' | 'SECRETARIA' | 'FINANCEIRO' | 'PROFESSOR' | 'VISUALIZADOR'
import { UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { inviteUser, toggleUserActive, changeUserRole } from './actions'

interface SerializedUser {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
  lastLoginAt: string | null
  createdAt: string
}

const ROLES: UserRole[] = ['ADMIN', 'SECRETARIA', 'FINANCEIRO', 'PROFESSOR', 'VISUALIZADOR']

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  SECRETARIA: 'bg-blue-100 text-blue-700',
  FINANCEIRO: 'bg-green-100 text-green-700',
  PROFESSOR: 'bg-purple-100 text-purple-700',
  VISUALIZADOR: 'bg-gray-100 text-gray-700',
}

export default function UsersClient({
  users: initial,
  roleLabels,
}: {
  users: SerializedUser[]
  roleLabels: Record<UserRole, string>
}) {
  const [users, setUsers] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    const fd = new FormData(e.currentTarget)
    const result = await inviteUser(fd)
    if ('error' in result) {
      setInviteError(result.error ?? 'Erro desconhecido')
      setInviting(false)
      return
    }
    setUsers((prev) => [result.user as SerializedUser, ...prev])
    setShowModal(false)
    setInviting(false)
  }

  async function handleToggleActive(id: string, current: boolean) {
    setLoadingId(id)
    await toggleUserActive(id, !current)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ativo: !current } : u)))
    setLoadingId(null)
  }

  async function handleRoleChange(id: string, role: UserRole) {
    setLoadingId(id)
    await changeUserRole(id, role)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    setLoadingId(null)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#1e3a5f] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Convidar usuário
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Nome</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Perfil</th>
              <th className="px-6 py-3 text-left">Último acesso</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{u.nome}</td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    disabled={loadingId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_COLORS[u.role]}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {roleLabels[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleDateString('pt-BR')
                    : 'Nunca'}
                </td>
                <td className="px-6 py-4">
                  {loadingId === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <button
                      onClick={() => handleToggleActive(u.id, u.ativo)}
                      title={u.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {u.ativo ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhum usuário cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Convidar usuário</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input name="nome" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha temporária</label>
                <input name="password" type="password" required minLength={8} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select name="role" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{roleLabels[r]}</option>
                  ))}
                </select>
              </div>
              {inviteError && (
                <p className="text-sm text-red-600">{inviteError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setInviteError('') }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-[#1e3a5f] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Convidar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
