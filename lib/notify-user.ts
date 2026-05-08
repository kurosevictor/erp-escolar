import { prisma } from '@/lib/prisma'

export async function notifyUser(
  userId: string,
  data: { titulo: string; mensagem?: string; link?: string }
) {
  try {
    await prisma.notificacao.create({ data: { userId, ...data } })
  } catch (err) {
    console.error('[Notificacao] Erro:', err)
  }
}

export async function notifyRole(
  role: string,
  data: { titulo: string; mensagem?: string; link?: string }
) {
  try {
    const users = await prisma.user.findMany({
      where: { role: role as never, ativo: true },
      select: { id: true },
    })
    if (users.length === 0) return
    await prisma.notificacao.createMany({
      data: users.map((u: { id: string }) => ({ userId: u.id, ...data })),
    })
  } catch (err) {
    console.error('[Notificacao] Erro notifyRole:', err)
  }
}
