import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DESPESAS_INICIAIS = [
  { nome: 'Aluguel', valor: 8318.98, diaVencimento: 10 },
  { nome: 'Wendi', valor: 5000, diaVencimento: 10 },
  { nome: 'João', valor: 2600, diaVencimento: 10 },
  { nome: 'Professores', valor: 4560, diaVencimento: 15 },
  { nome: 'Victor (Marketing)', valor: 450, diaVencimento: 15 },
  { nome: 'Impulsionamento', valor: 0, diaVencimento: 15 },
  { nome: 'Impostos', valor: 2118, diaVencimento: 19 },
  { nome: 'Contabilidade', valor: 330, diaVencimento: 19 },
  { nome: 'INSS', valor: 178.31, diaVencimento: 19 },
  { nome: 'Professores Administrativo', valor: 2050, diaVencimento: 20 },
  { nome: 'Celular', valor: 220, diaVencimento: 22 },
  { nome: 'Internet', valor: 265, diaVencimento: 22 },
  { nome: 'Impressora', valor: 326, diaVencimento: 25 },
  { nome: 'Luz', valor: 450, diaVencimento: 25 },
  { nome: 'Água', valor: 160, diaVencimento: 25 },
  { nome: 'Solda', valor: 0, diaVencimento: 25 },
  { nome: 'Insumos', valor: 0, diaVencimento: 25 },
  { nome: 'Segundo Impulsionamento', valor: 150, diaVencimento: 25 },
  { nome: 'ACIJS', valor: 90, diaVencimento: 25 },
]

export async function GET() {
  const count = await prisma.despesa.count()
  if (count === 0) {
    await prisma.despesa.createMany({ data: DESPESAS_INICIAIS })
  }

  const [despesas, totalMensalidadesPagas] = await Promise.all([
    prisma.despesa.findMany({ orderBy: [{ diaVencimento: 'asc' }, { createdAt: 'asc' }] }),
    prisma.parcela.aggregate({ where: { pago: true }, _sum: { valor: true } }),
  ])

  return NextResponse.json({
    despesas,
    totalMensalidadesPagas: totalMensalidadesPagas._sum.valor ?? 0,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const despesa = await prisma.despesa.create({
    data: {
      nome: body.nome,
      valor: body.valor ?? 0,
      diaVencimento: body.diaVencimento,
    },
  })
  return NextResponse.json(despesa, { status: 201 })
}
