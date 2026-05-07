import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  await requireAuth()
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (q.length < 2) return NextResponse.json([])

  const alunos = await prisma.aluno.findMany({
    where: {
      OR: [
        { nome: { contains: q, mode: 'insensitive' } },
        { cpf: { contains: q.replace(/\D/g, '') } },
      ],
    },
    select: {
      id: true,
      nome: true,
      foto: true,
      turma: { select: { nome: true } },
      situacaoMatricula: true,
    },
    take: 8,
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(alunos)
}
