import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const despesaId = searchParams.get('despesaId')
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  const where: Record<string, unknown> = {}
  if (despesaId) where.despesaId = despesaId
  if (mes) where.mes = parseInt(mes)
  if (ano) where.ano = parseInt(ano)

  const historico = await prisma.despesaHistorico.findMany({
    where,
    orderBy: [{ ano: 'desc' }, { mes: 'desc' }, { nome: 'asc' }],
  })

  return NextResponse.json({ historico })
}
