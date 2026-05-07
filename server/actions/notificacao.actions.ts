'use server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getNotificacoes(limit = 10) {
  const user = await requireAuth()
  return prisma.notificacao.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function marcarLida(id: string) {
  const user = await requireAuth()
  await prisma.notificacao.update({
    where: { id, userId: user.id },
    data: { lida: true, lidaEm: new Date() },
  })
  revalidatePath('/')
}

export async function marcarTodasLidas() {
  const user = await requireAuth()
  await prisma.notificacao.updateMany({
    where: { userId: user.id, lida: false },
    data: { lida: true, lidaEm: new Date() },
  })
  revalidatePath('/')
}
