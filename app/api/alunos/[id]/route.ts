import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { audit } from '@/lib/audit'
import { updateAlunoSchema } from '@/lib/schemas/aluno.schema'
import { z } from 'zod'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const aluno = await prisma.aluno.findFirst({
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
  const body: unknown = await request.json()

  const parsed = updateAlunoSchema.safeParse({ ...(body as object), id })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data = parsed.data
  const before = await prisma.aluno.findFirst({ where: { id } })

  const aluno = await prisma.aluno.update({
    where: { id },
    data: {
      nome: data.nome,
      cpf: data.cpf ?? undefined,
      email: data.email ?? null,
      telefone: data.telefone ?? null,
      dataNascimento: data.dataNascimento ?? null,
      dataMatricula: data.dataMatricula ?? undefined,
      situacaoMatricula: data.situacaoMatricula,
      observacoes: data.observacoes ?? null,
      turmaId: data.turmaId,
      turmaId2: data.turmaId2 ?? null,
      turmaId3: data.turmaId3 ?? null,
    },
    include: { turma: true, pagamentos: { orderBy: { numero: 'asc' } } },
  })

  await audit({
    action: 'UPDATE',
    entity: 'Aluno',
    entityId: id,
    before: before ? { nome: before.nome, situacaoMatricula: before.situacaoMatricula, turmaId: before.turmaId } : undefined,
    after: { nome: aluno.nome, situacaoMatricula: aluno.situacaoMatricula, turmaId: aluno.turmaId },
  })

  return NextResponse.json(aluno)
}

const patchSchema = z.object({
  anotacaoFinanceiro: z.string().nullable().optional(),
  cpfResponsavel: z.string().nullable().optional(),
  materialPago: z.boolean().optional(),
  materialEnviado: z.boolean().optional(),
  emListaMaterial: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body: unknown = await request.json()

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data = parsed.data
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
  const before = await prisma.aluno.findFirst({ where: { id } })

  // Soft delete cascata via $extends: deleteMany em Parcela também vira soft delete
  await prisma.parcela.deleteMany({ where: { alunoId: id } })
  await prisma.presenca.deleteMany({ where: { alunoId: id } })
  await prisma.aluno.delete({ where: { id } })

  await audit({
    action: 'DELETE',
    entity: 'Aluno',
    entityId: id,
    before: before ? { nome: before.nome, cpf: before.cpf } : undefined,
  })

  return NextResponse.json({ success: true })
}
