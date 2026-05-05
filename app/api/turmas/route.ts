import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const turmas = await prisma.turma.findMany({
    where: { ativo: true },
    orderBy: [{ curso: 'asc' }, { nome: 'asc' }],
  })
  return NextResponse.json(turmas)
}
