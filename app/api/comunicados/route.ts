import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await requireAuth()
  const { searchParams } = new URL(req.url)
  const rascunho = searchParams.get('rascunho') === '1'
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const comunicados = await prisma.comunicado.findMany({
    where: { deletedAt: null, rascunho },
    include: { autor: { select: { nome: true } }, turma: { select: { nome: true } } },
    orderBy: [{ fixado: 'desc' }, { publicadoEm: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  })

  return NextResponse.json(comunicados)
}
