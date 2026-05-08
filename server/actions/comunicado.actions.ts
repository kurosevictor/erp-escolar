'use server'
import { prisma } from '@/lib/prisma'
import { requireAuth, can } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
type DestinatarioComunicado = 'TODOS' | 'TURMA' | 'RESPONSAVEIS' | 'PROFESSORES' | 'STAFF'

const comunicadoSchema = z.object({
  titulo: z.string().min(1).max(200),
  corpo: z.string().min(1),
  destinatario: z.enum(['TODOS', 'TURMA', 'RESPONSAVEIS', 'PROFESSORES', 'STAFF']),
  turmaId: z.string().optional().nullable(),
  fixado: z.boolean().default(false),
})

export async function criarComunicado(data: z.infer<typeof comunicadoSchema> & { publicar?: boolean }) {
  const user = await requireAuth()
  if (!can(user.role, 'comunicado.create')) throw new Error('Sem permissão')

  const parsed = comunicadoSchema.parse(data)
  const comunicado = await prisma.comunicado.create({
    data: {
      ...parsed,
      autorId: user.id,
      rascunho: !data.publicar,
      publicadoEm: data.publicar ? new Date() : null,
    },
  })

  await audit({ action: 'CREATE', entity: 'Comunicado', entityId: comunicado.id, userId: user.id, userEmail: user.email })
  revalidatePath('/comunicados')
  return comunicado
}

export async function atualizarComunicado(
  id: string,
  data: z.infer<typeof comunicadoSchema> & { publicar?: boolean }
) {
  const user = await requireAuth()
  if (!can(user.role, 'comunicado.update')) throw new Error('Sem permissão')

  const parsed = comunicadoSchema.parse(data)
  const comunicado = await prisma.comunicado.update({
    where: { id },
    data: {
      ...parsed,
      rascunho: !data.publicar,
      publicadoEm: data.publicar ? new Date() : undefined,
    },
  })

  await audit({ action: 'UPDATE', entity: 'Comunicado', entityId: id, userId: user.id, userEmail: user.email })
  revalidatePath('/comunicados')
  return comunicado
}

export async function deletarComunicado(id: string) {
  const user = await requireAuth()
  if (!can(user.role, 'comunicado.delete')) throw new Error('Sem permissão')
  await prisma.comunicado.update({ where: { id }, data: { deletedAt: new Date() } })
  await audit({ action: 'DELETE', entity: 'Comunicado', entityId: id, userId: user.id, userEmail: user.email })
  revalidatePath('/comunicados')
}
