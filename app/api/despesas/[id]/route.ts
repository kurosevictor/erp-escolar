import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const data: { pago?: boolean; valor?: number; dataPagamento?: Date | null } = {}
  if (typeof body.pago === 'boolean') {
    data.pago = body.pago
    data.dataPagamento = body.pago ? new Date() : null
  }
  if (typeof body.valor === 'number') {
    data.valor = body.valor
  }

  const despesa = await prisma.despesa.update({ where: { id }, data })

  // Grava histórico ao marcar como pago
  if (body.pago === true) {
    const agora = new Date()
    await prisma.despesaHistorico.create({
      data: {
        despesaId: id,
        nome: despesa.nome,
        valor: despesa.valor,
        mes: agora.getMonth() + 1,
        ano: agora.getFullYear(),
        dataPagamento: agora,
      },
    })
  }

  return NextResponse.json(despesa)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.despesa.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
