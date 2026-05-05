import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const configs = await prisma.configuracaoSheet.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(configs)
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  if (data.id) {
    const config = await prisma.configuracaoSheet.update({
      where: { id: data.id },
      data,
    })
    return NextResponse.json(config)
  }

  const config = await prisma.configuracaoSheet.create({ data })
  return NextResponse.json(config, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.configuracaoSheet.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
