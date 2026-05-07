'use client'
import { useEffect, useState } from 'react'
import { Users, LogOut, Shield } from 'lucide-react'
import { UserRole } from '@prisma/client'
import { signOut } from '@/app/(auth)/login/actions'

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  SECRETARIA: 'Secretaria',
  FINANCEIRO: 'Financeiro',
  PROFESSOR: 'Professor',
  VISUALIZADOR: 'Visualizador',
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  SECRETARIA: 'bg-blue-100 text-blue-700',
  FINANCEIRO: 'bg-green-100 text-green-700',
  PROFESSOR: 'bg-purple-100 text-purple-700',
  VISUALIZADOR: 'bg-gray-100 text-gray-700',
}

interface HeaderProps {
  userName: string
  userRole: UserRole
}

export default function Header({ userName, userRole }: HeaderProps) {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setTotal(d.totalAlunos))
      .catch(() => {})
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">ERP Escolar</h2>
        {total !== null && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{total} alunos</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 font-medium">{userName}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[userRole]}`}>
            {ROLE_LABELS[userRole]}
          </span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}
