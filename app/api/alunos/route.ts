import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const curso = searchParams.get('curso') || ''
  const turno = searchParams.get('turno') || ''
  const matricula = searchParams.get('matricula') || ''
  const inadimplente = searchParams.get('inadimplente') || ''

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { nome: { contains: search, mode: 'insensitive' } },
      { cpf: { contains: search } },
    ]
  }
  if (curso) where.turma = { ...((where.turma as object) || {}), curso }
  if (turno) where.turma = { ...((where.turma as object) || {}), turno }
  if (matricula) where.situacaoMatricula = matricula
  if (inadimplente === '1') {
    where.pagamentos = { some: { pago: false, vencimento: { lt: new Date() } } }
  }

  const [alunos, total] = await Promise.all([
    prisma.aluno.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { nome: 'asc' },
      include: { turma: true, pagamentos: true },
    }),
    prisma.aluno.count({ where }),
  ])

  return NextResponse.json({ alunos, total, page, limit })
}

export async function POST(request: NextRequest) {
  const data = await request.json()

  const aluno = await prisma.aluno.create({
    data: {
      nome: data.nome,
      cpf: data.cpf.replace(/\D/g, ''),
      email: data.email || null,
      telefone: data.telefone ? data.telefone.replace(/\D/g, '') : null,
      foto: data.foto || null,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : null,
      dataMatricula: new Date(data.dataMatricula),
      situacaoMatricula: data.situacaoMatricula || 'ATIVO',
      observacoes: data.observacoes || null,
      turmaId: data.turmaId,
    },
    include: { turma: true, pagamentos: true },
  })

  return NextResponse.json(aluno, { status: 201 })
}
