import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '10')
  const apenasNaoLidas = req.nextUrl.searchParams.get('naoLidas') === '1'

  const notificacoes = await prisma.notificacao.findMany({
    where: { userId: user.id, ...(apenasNaoLidas ? { lida: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const totalNaoLidas = await prisma.notificacao.count({
    where: { userId: user.id, lida: false },
  })

  return NextResponse.json({ notificacoes, totalNaoLidas })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()

  if (body.all) {
    await prisma.notificacao.updateMany({
      where: { userId: user.id, lida: false },
      data: { lida: true, lidaEm: new Date() },
    })
  } else if (body.id) {
    await prisma.notificacao.update({
      where: { id: body.id, userId: user.id },
      data: { lida: true, lidaEm: new Date() },
    })
  }

  return NextResponse.json({ ok: true })
}
