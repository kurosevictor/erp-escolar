import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (typeof body.concluida === 'boolean') {
    data.concluida = body.concluida
    data.concluidaEm = body.concluida ? new Date() : null
  }
  if (body.titulo) data.titulo = body.titulo
  const tarefa = await prisma.tarefa.update({ where: { id }, data })
  return NextResponse.json(tarefa)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params
  await prisma.tarefa.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
