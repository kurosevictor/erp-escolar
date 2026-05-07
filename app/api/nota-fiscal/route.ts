import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mes = parseInt(searchParams.get('mes') || String(new Date().getMonth() + 1))
  const ano = parseInt(searchParams.get('ano') || String(new Date().getFullYear()))

  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)

  const alunos = await prisma.aluno.findMany({
    where: {
      pagamentos: {
        some: { pago: true, vencimento: { gte: inicio, lte: fim } },
      },
    },
    select: {
      id: true,
      nome: true,
      cpf: true,
      cpfResponsavel: true,
      foto: true,
      anotacaoFinanceiro: true,
      pagamentos: {
        where: { pago: true, vencimento: { gte: inicio, lte: fim } },
        select: { id: true, valor: true, nfEmitida: true },
      },
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(alunos)
}
