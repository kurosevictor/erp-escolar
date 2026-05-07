import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const user = await requireAuth()
  try {
    const tarefas = await prisma.tarefa.findMany({
      where: { autorId: user.id, concluida: false },
      orderBy: [{ prazo: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
      take: 10,
    })
    return NextResponse.json(tarefas)
  } catch (e) {
    console.error('[tarefas GET]', e)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const tarefa = await prisma.tarefa.create({
    data: { titulo: body.titulo, prazo: body.prazo ? new Date(body.prazo) : null, autorId: user.id },
  })
  return NextResponse.json(tarefa, { status: 201 })
}
