'use server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export interface KPIsFinanceiro {
  receitaRealizada: number
  receitaEsperada: number
  taxaInadimplencia: number
  ticketMedio: number
  mes: number
  ano: number
}

export interface ReceitaMensal {
  mesAno: string
  receitaRealizada: number
  receitaEsperada: number
  inadimplentes: number
}

export interface InadimplenciaFaixa {
  faixa: string
  diasMin: number
  diasMax: number | null
  alunos: number
  valorEmAberto: number
}

export interface ReceitaCurso {
  curso: string
  valor: number
}

export async function getKPIsFinanceiro(mes: number, ano: number): Promise<KPIsFinanceiro> {
  await requireAuth()

  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)
  const hoje = new Date()

  const [pagas, todas, totalAtivos, pagadores] = await Promise.all([
    prisma.parcela.findMany({
      where: { pago: true, dataPagamento: { gte: inicio, lte: fim } },
      select: { valor: true },
    }),
    prisma.parcela.findMany({
      where: { vencimento: { gte: inicio, lte: fim } },
      select: { valor: true },
    }),
    prisma.aluno.count({ where: { situacaoMatricula: 'ATIVO' } }),
    prisma.parcela.findMany({
      where: { pago: true, dataPagamento: { gte: inicio, lte: fim } },
      select: { alunoId: true },
      distinct: ['alunoId'],
    }),
  ])

  const inadimplentesCount = await prisma.aluno.count({
    where: {
      situacaoMatricula: 'ATIVO',
      pagamentos: { some: { pago: false, vencimento: { lt: hoje } } },
    },
  })

  const receitaRealizada = pagas.reduce((s: number, p: { valor: number }) => s + p.valor, 0)
  const receitaEsperada = todas.reduce((s: number, p: { valor: number }) => s + p.valor, 0)
  const taxaInadimplencia = totalAtivos > 0 ? Math.round((inadimplentesCount / totalAtivos) * 100) : 0
  const ticketMedio = pagadores.length > 0 ? receitaRealizada / pagadores.length : 0

  return { receitaRealizada, receitaEsperada, taxaInadimplencia, ticketMedio, mes, ano }
}

export async function getReceitaMensal(meses: number = 12): Promise<ReceitaMensal[]> {
  await requireAuth()

  const resultado: ReceitaMensal[] = []
  const hoje = new Date()

  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const inicio = new Date(d.getFullYear(), d.getMonth(), 1)
    const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    const [pagas, todas] = await Promise.all([
      prisma.parcela.findMany({
        where: { pago: true, dataPagamento: { gte: inicio, lte: fim } },
        select: { valor: true },
      }),
      prisma.parcela.findMany({
        where: { vencimento: { gte: inicio, lte: fim } },
        select: { valor: true },
      }),
    ])

    const inadimplentes = await prisma.parcela.findMany({
      where: { pago: false, vencimento: { gte: inicio, lte: fim } },
      select: { alunoId: true },
      distinct: ['alunoId'],
    })

    const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    resultado.push({
      mesAno: `${MESES_ABREV[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      receitaRealizada: pagas.reduce((s, p) => s + p.valor, 0),
      receitaEsperada: todas.reduce((s, p) => s + p.valor, 0),
      inadimplentes: inadimplentes.length,
    })
  }

  return resultado
}

export async function getInadimplenciaFaixas(): Promise<InadimplenciaFaixa[]> {
  await requireAuth()

  const hoje = new Date()
  const faixas = [
    { faixa: '1 a 30 dias',      diasMin: 1,   diasMax: 30  },
    { faixa: '31 a 60 dias',     diasMin: 31,  diasMax: 60  },
    { faixa: '61 a 90 dias',     diasMin: 61,  diasMax: 90  },
    { faixa: 'Mais de 90 dias',  diasMin: 91,  diasMax: null },
  ]

  const resultado: InadimplenciaFaixa[] = []

  for (const f of faixas) {
    const dataFim = new Date(hoje)
    dataFim.setDate(hoje.getDate() - f.diasMin)
    dataFim.setHours(23, 59, 59)

    const dataInicio = f.diasMax
      ? (() => { const d = new Date(hoje); d.setDate(hoje.getDate() - f.diasMax); return d })()
      : new Date(0)

    const parcelas = await prisma.parcela.findMany({
      where: {
        pago: false,
        vencimento: { gte: dataInicio, lte: dataFim },
      },
      select: { valor: true, alunoId: true },
    })

    const alunosUnicos = new Set(parcelas.map((p: { valor: number; alunoId: string }) => p.alunoId)).size
    const valorEmAberto = parcelas.reduce((s: number, p: { valor: number; alunoId: string }) => s + p.valor, 0)

    resultado.push({ ...f, alunos: alunosUnicos, valorEmAberto })
  }

  return resultado
}

export async function getReceitaPorCurso(): Promise<ReceitaCurso[]> {
  await requireAuth()

  const parcelas = await prisma.parcela.findMany({
    where: { pago: true },
    select: {
      valor: true,
      aluno: { select: { turma: { select: { curso: true } } } },
    },
  })

  const mapa: Record<string, number> = {}
  for (const p of parcelas) {
    const curso = p.aluno.turma.curso
    mapa[curso] = (mapa[curso] ?? 0) + p.valor
  }

  return Object.entries(mapa)
    .map(([curso, valor]) => ({ curso, valor }))
    .sort((a, b) => b.valor - a.valor)
}
