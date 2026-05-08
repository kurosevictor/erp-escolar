import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
type StatusPresenca = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO' | 'ATESTADO'

export async function GET() {
  const user = await requireAuth()
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const turmas = await prisma.turma.findMany({
    where: { ativo: true },
    include: {
      chamadas: { where: { data: hoje }, select: { id: true, fechada: true } },
      _count: { select: { alunos: { where: { situacaoMatricula: 'ATIVO' } } } },
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(turmas)
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const { turmaId, data, autorId } = await req.json()

  const dataObj = new Date(data)
  dataObj.setHours(0, 0, 0, 0)

  const existing = await prisma.chamada.findUnique({
    where: { turmaId_data: { turmaId, data: dataObj } },
    include: { presencas: true },
  })
  if (existing) return NextResponse.json(existing)

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: { alunos: { where: { situacaoMatricula: 'ATIVO' } } },
  })
  if (!turma) return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })

  const chamada = await prisma.chamada.create({
    data: {
      turmaId,
      data: dataObj,
      autorId: autorId ?? user.id,
      presencas: {
        create: turma.alunos.map(a => ({ alunoId: a.id, status: 'AUSENTE' as StatusPresenca })),
      },
    },
    include: { presencas: true },
  })

  return NextResponse.json(chamada, { status: 201 })
}
