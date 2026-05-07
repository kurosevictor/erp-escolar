import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const { id } = await params
  const body = await req.json()

  if (body.fechada === false && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas admins podem reabrir chamadas' }, { status: 403 })
  }

  const chamada = await prisma.chamada.update({
    where: { id },
    data: { fechada: body.fechada },
  })
  return NextResponse.json(chamada)
}
