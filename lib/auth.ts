import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
type UserRole = 'ADMIN' | 'SECRETARIA' | 'FINANCEIRO' | 'PROFESSOR' | 'VISUALIZADOR'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findFirst({
    where: { supabaseId: session.user.id, ativo: true },
    // deletedAt: null é adicionado automaticamente pelo $extends
  })
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role)) redirect('/nao-autorizado')
  return user
}

const PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'],
  SECRETARIA: ['aluno.*', 'material.*', 'comunicado.*', 'chamada.read', 'financeiro.read', 'mensalidade.read'],
  FINANCEIRO: ['aluno.read', 'parcela.*', 'nf.*', 'relatorio.*', 'mensalidade.*'],
  PROFESSOR: ['aluno.read', 'chamada.*', 'ocorrencia.create'],
  VISUALIZADOR: ['*.read'],
}

export function can(userRole: UserRole, permission: string): boolean {
  const perms = PERMISSIONS[userRole]
  if (perms.includes('*')) return true
  if (perms.includes(permission)) return true

  const [entity, action] = permission.split('.')
  if (perms.includes(`${entity}.*`)) return true
  if (perms.includes(`*.${action}`)) return true

  return false
}
