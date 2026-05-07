import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    include: { turma: true, pagamentos: { orderBy: { numero: 'asc' } }, presencas: true },
  })
  if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
  return NextResponse.json(aluno)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()

  const aluno = await prisma.aluno.update({
    where: { id },
    data: {
      nome: data.nome,
      cpf: data.cpf ? data.cpf.replace(/\D/g, '') : undefined,
      email: data.email || null,
      telefone: data.telefone ? data.telefone.replace(/\D/g, '') : null,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      dataMatricula: data.dataMatricula ? new Date(data.dataMatricula) : undefined,
      situacaoMatricula: data.situacaoMatricula,
      observacoes: data.observacoes || null,
      turmaId: data.turmaId,
    },
    include: { turma: true, pagamentos: { orderBy: { numero: 'asc' } } },
  })

  return NextResponse.json(aluno)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await request.json()
  const aluno = await prisma.aluno.update({
    where: { id },
    data: {
      ...('anotacaoFinanceiro' in data && { anotacaoFinanceiro: data.anotacaoFinanceiro ?? null }),
      ...('cpfResponsavel' in data && { cpfResponsavel: data.cpfResponsavel ?? null }),
      ...('materialPago' in data && { materialPago: data.materialPago }),
      ...('materialEnviado' in data && { materialEnviado: data.materialEnviado }),
      ...('emListaMaterial' in data && { emListaMaterial: data.emListaMaterial }),
    },
  })
  return NextResponse.json(aluno)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // delete related records first
  await prisma.parcela.deleteMany({ where: { alunoId: id } })
  await prisma.presenca.deleteMany({ where: { alunoId: id } })
  await prisma.aluno.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
