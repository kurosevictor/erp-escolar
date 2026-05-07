import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { StatusPresenca } from '@prisma/client'

export async function POST(req: NextRequest) {
  await requireAuth()
  const body = await req.json()
  const { chamadaId, alunoId, status, observacao } = body

  const presenca = await prisma.presenca.upsert({
    where: { chamadaId_alunoId: { chamadaId, alunoId } },
    update: { status: status as StatusPresenca, observacao: observacao ?? null },
    create: { chamadaId, alunoId, status: status as StatusPresenca, observacao: observacao ?? null },
  })

  return NextResponse.json(presenca)
}
