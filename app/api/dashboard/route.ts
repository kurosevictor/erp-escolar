import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalAlunos,
      alunosAtivos,
      totalTurmas,
      turmasRaw,
      parcelasVencidas,
      recentes,
    ] = await Promise.all([
      prisma.aluno.count(),
      prisma.aluno.count({ where: { situacaoMatricula: 'ATIVO' } }),
      prisma.turma.count({ where: { ativo: true } }),
      prisma.turma.findMany({
        select: { curso: true, _count: { select: { alunos: true } } },
      }),
      prisma.parcela.count({
        where: { pago: false, vencimento: { lt: new Date() } },
      }),
      prisma.aluno.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { turma: { select: { curso: true, turno: true } } },
      }),
    ])

    // alunos inadimplentes = tem parcela vencida e não paga
    const inadimplentesRaw = await prisma.aluno.findMany({
      where: {
        pagamentos: { some: { pago: false, vencimento: { lt: new Date() } } },
      },
      select: { id: true },
    })

    const porCurso = turmasRaw.map((t: (typeof turmasRaw)[number]) => ({
      curso: t.curso,
      total: t._count.alunos,
    }))

    const [pagos, pendentes] = await Promise.all([
      prisma.parcela.count({ where: { pago: true } }),
      prisma.parcela.count({ where: { pago: false } }),
    ])

    const porPagamento = [
      { situacao: 'EM_DIA', total: pagos },
      { situacao: 'INADIMPLENTE', total: pendentes },
    ]

    return NextResponse.json({
      totalAlunos,
      inadimplentes: inadimplentesRaw.length,
      alunosAtivos,
      totalCursos: totalTurmas,
      porCurso,
      porPagamento,
      recentes,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
