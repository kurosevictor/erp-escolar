import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const alunos = await prisma.aluno.findMany({
    where: { emListaMaterial: true },
    select: {
      id: true,
      nome: true,
      cpf: true,
      cpfResponsavel: true,
      email: true,
      foto: true,
      materialPago: true,
      materialEnviado: true,
      turma: { select: { curso: true } },
    },
    orderBy: { nome: 'asc' },
  })
  return NextResponse.json(alunos)
}
