'use server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
type StatusPresenca = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO' | 'ATESTADO'

export type StatusFrequencia = 'OK' | 'ATENCAO' | 'CRITICO'

export interface FrequenciaAluno {
  alunoId: string
  nome: string
  foto: string | null
  presencas: number
  faltas: number
  percentual: number
  status: StatusFrequencia
}

export interface FrequenciaTurma {
  turmaId: string
  nome: string
  curso: string
  turno: string
  horario: string
  totalChamadas: number
  mediaPresenca: number
  alunosEmRisco: number
  status: StatusFrequencia
}

function getStatusFrequencia(percentual: number): StatusFrequencia {
  if (percentual >= 75) return 'OK'
  if (percentual >= 50) return 'ATENCAO'
  return 'CRITICO'
}

export async function getFrequenciaTurmaDetalhe(
  turmaId: string,
  mes: number,
  ano: number
): Promise<{ turma: { nome: string; curso: string }; alunos: FrequenciaAluno[]; mediaGeral: number }> {
  await requireAuth()

  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    select: { nome: true, curso: true },
  })
  if (!turma) throw new Error('Turma não encontrada')

  const chamadas = await prisma.chamada.findMany({
    where: { turmaId, data: { gte: inicio, lte: fim } },
    include: { presencas: { select: { alunoId: true, status: true } } },
  })

  const alunos = await prisma.aluno.findMany({
    where: { turmaId, situacaoMatricula: 'ATIVO' },
    select: { id: true, nome: true, foto: true },
    orderBy: { nome: 'asc' },
  })

  const PRESENTES: StatusPresenca[] = ['PRESENTE', 'JUSTIFICADO']

  const resultado: FrequenciaAluno[] = alunos.map((a) => {
    let presencas = 0
    let faltas = 0
    for (const ch of chamadas) {
      const p = ch.presencas.find((pr) => pr.alunoId === a.id)
      if (!p || p.status === 'AUSENTE') {
        faltas++
      } else if (PRESENTES.includes(p.status)) {
        presencas++
      }
    }
    const total = presencas + faltas
    const percentual = total > 0 ? Math.round((presencas / total) * 100) : 100
    return { alunoId: a.id, nome: a.nome, foto: a.foto, presencas, faltas, percentual, status: getStatusFrequencia(percentual) }
  })

  const mediaGeral = resultado.length > 0
    ? Math.round(resultado.reduce((s, a) => s + a.percentual, 0) / resultado.length)
    : 100

  return { turma, alunos: resultado, mediaGeral }
}

export async function getFrequenciaGeral(mes: number, ano: number): Promise<FrequenciaTurma[]> {
  await requireAuth()

  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)

  const turmas = await prisma.turma.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, curso: true, turno: true, horario: true },
    orderBy: { curso: 'asc' },
  })

  const PRESENTES: StatusPresenca[] = ['PRESENTE', 'JUSTIFICADO']
  const resultado: FrequenciaTurma[] = []

  for (const t of turmas) {
    const chamadas = await prisma.chamada.findMany({
      where: { turmaId: t.id, data: { gte: inicio, lte: fim } },
      include: { presencas: { select: { alunoId: true, status: true } } },
    })

    const alunos = await prisma.aluno.findMany({
      where: { turmaId: t.id, situacaoMatricula: 'ATIVO' },
      select: { id: true },
    })

    if (chamadas.length === 0) {
      resultado.push({
        turmaId: t.id, nome: t.nome, curso: t.curso, turno: t.turno, horario: t.horario,
        totalChamadas: 0, mediaPresenca: 100, alunosEmRisco: 0, status: 'OK',
      })
      continue
    }

    let somaPercent = 0
    let alunosEmRisco = 0

    for (const a of alunos) {
      let presencas = 0
      let faltas = 0
      for (const ch of chamadas) {
        const p = ch.presencas.find((pr) => pr.alunoId === a.id)
        if (!p || p.status === 'AUSENTE') faltas++
        else if (PRESENTES.includes(p.status)) presencas++
      }
      const total = presencas + faltas
      const pct = total > 0 ? (presencas / total) * 100 : 100
      somaPercent += pct
      if (pct < 75) alunosEmRisco++
    }

    const mediaPresenca = alunos.length > 0 ? Math.round(somaPercent / alunos.length) : 100

    resultado.push({
      turmaId: t.id, nome: t.nome, curso: t.curso, turno: t.turno, horario: t.horario,
      totalChamadas: chamadas.length,
      mediaPresenca,
      alunosEmRisco,
      status: getStatusFrequencia(mediaPresenca),
    })
  }

  return resultado
}

export async function getAlunosEmRiscoCount(mes: number, ano: number): Promise<number> {
  await requireAuth()

  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 0, 23, 59, 59)
  const PRESENTES: StatusPresenca[] = ['PRESENTE', 'JUSTIFICADO']

  const turmas = await prisma.turma.findMany({
    where: { ativo: true },
    select: {
      alunos: { where: { situacaoMatricula: 'ATIVO' }, select: { id: true } },
      chamadas: {
        where: { data: { gte: inicio, lte: fim } },
        select: { presencas: { select: { alunoId: true, status: true } } },
      },
    },
  })

  let emRisco = 0
  for (const t of turmas) {
    for (const a of t.alunos) {
      let presencas = 0; let faltas = 0
      for (const ch of t.chamadas) {
        const p = ch.presencas.find((pr) => pr.alunoId === a.id)
        if (!p || p.status === 'AUSENTE') faltas++
        else if (PRESENTES.includes(p.status)) presencas++
      }
      const total = presencas + faltas
      if (total > 0 && (presencas / total) < 0.75) emRisco++
    }
  }

  return emRisco
}
