'use server'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { audit } from '@/lib/audit'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const inviteSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
})

export async function inviteUser(formData: FormData) {
  const admin = await requireRole(['ADMIN'])

  const parsed = inviteSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos: ' + JSON.stringify(parsed.error.flatten().fieldErrors) }
  }

  const { nome, email, password, role } = parsed.data

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return { error: error.message }
  }

  const user = await prisma.user.create({
    data: {
      supabaseId: data.user.id,
      email,
      nome,
      role,
    },
  })

  await audit({
    userId: admin.id,
    userEmail: admin.email,
    action: 'CREATE',
    entity: 'User',
    entityId: user.id,
    after: { nome, email, role },
  })

  return {
    user: {
      ...user,
      lastLoginAt: null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: null,
    },
  }
}

export async function toggleUserActive(id: string, ativo: boolean) {
  const admin = await requireRole(['ADMIN'])

  const before = await prisma.user.findUnique({ where: { id } })

  await prisma.user.update({ where: { id }, data: { ativo } })

  await audit({
    userId: admin.id,
    userEmail: admin.email,
    action: 'UPDATE',
    entity: 'User',
    entityId: id,
    before: before ? { ativo: before.ativo } : undefined,
    after: { ativo },
  })
}

export async function changeUserRole(id: string, role: UserRole) {
  const admin = await requireRole(['ADMIN'])

  const before = await prisma.user.findUnique({ where: { id } })

  await prisma.user.update({ where: { id }, data: { role } })

  await audit({
    userId: admin.id,
    userEmail: admin.email,
    action: 'UPDATE',
    entity: 'User',
    entityId: id,
    before: before ? { role: before.role } : undefined,
    after: { role },
  })
}
