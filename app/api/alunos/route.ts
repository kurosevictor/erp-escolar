import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { audit } from '@/lib/audit'
import { createAlunoSchema } from '@/lib/schemas/aluno.schema'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const curso = searchParams.get('curso') || ''
  const turno = searchParams.get('turno') || ''
  const matricula = searchParams.get('matricula') || ''
  const inadimplente = searchParams.get('inadimplente') || ''
  const sort = searchParams.get('sort') || 'nome'

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

  try {
    const [alunos, total] = await Promise.all([
      prisma.aluno.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy:
          sort === 'diaVencimento'
            ? [{ diaVencimento: { sort: 'asc', nulls: 'last' } }]
            : sort === 'valor'
            ? [{ valorMensalidade: { sort: 'desc', nulls: 'last' } }]
            : { nome: 'asc' },
        include: { turma: true, pagamentos: true },
      }),
      prisma.aluno.count({ where }),
    ])
    return NextResponse.json({ alunos, total, page, limit })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro interno'
    console.error('[GET /api/alunos]', e)
    return NextResponse.json({ error: msg, alunos: [], total: 0, page, limit }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json()

  const parsed = createAlunoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data = parsed.data

  const aluno = await prisma.aluno.create({
    data: {
      nome: data.nome,
      cpf: data.cpf ?? '',
      email: data.email ?? null,
      telefone: data.telefone ?? null,
      foto: data.foto ?? null,
      dataNascimento: data.dataNascimento ?? null,
      dataMatricula: data.dataMatricula ?? new Date(),
      situacaoMatricula: data.situacaoMatricula ?? 'ATIVO',
      observacoes: data.observacoes ?? null,
      turmaId: data.turmaId,
      diaVencimento: data.diaVencimento ?? null,
      valorMensalidade: data.valorMensalidade ?? null,
    },
    include: { turma: true, pagamentos: true },
  })

  await audit({
    action: 'CREATE',
    entity: 'Aluno',
    entityId: aluno.id,
    after: { nome: aluno.nome, cpf: aluno.cpf, turmaId: aluno.turmaId },
  })

  return NextResponse.json(aluno, { status: 201 })
}
