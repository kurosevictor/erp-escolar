import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

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
  await requireAuth()

  try {
    const count = await prisma.despesa.count()
    if (count === 0) {
      await prisma.despesa.createMany({ data: DESPESAS_INICIAIS })
    }

    const [despesas, parcelasPagas] = await Promise.all([
      prisma.despesa.findMany({ orderBy: [{ diaVencimento: 'asc' }, { createdAt: 'asc' }] }),
      prisma.parcela.findMany({ where: { pago: true }, select: { valor: true } }),
    ])

    const totalMensalidadesPagas = parcelasPagas.reduce((sum, p) => sum + p.valor, 0)

    return NextResponse.json({ despesas, totalMensalidadesPagas })
  } catch (e) {
    console.error('[despesas GET]', e)
    return NextResponse.json({ despesas: [], totalMensalidadesPagas: 0 }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await requireAuth()
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
