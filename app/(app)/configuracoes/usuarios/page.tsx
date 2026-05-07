import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import UsersClient from './users-client'

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  SECRETARIA: 'Secretaria',
  FINANCEIRO: 'Financeiro',
  PROFESSOR: 'Professor',
  VISUALIZADOR: 'Visualizador',
}

export default async function UsuariosPage() {
  await requireRole(['ADMIN'])

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const serialized = users.map((u) => ({
    ...u,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    deletedAt: u.deletedAt ? u.deletedAt.toISOString() : null,
  }))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">Gerenciamento de acesso ao sistema</p>
        </div>
      </div>

      <UsersClient users={serialized} roleLabels={ROLE_LABELS} />
    </div>
  )
}
