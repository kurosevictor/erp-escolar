'use server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export type StatusVaga = 'LOTADA' | 'CRITICA' | 'ATENCAO' | 'OK'

export interface VagasTurma {
  id: string
  nome: string
  curso: string
  turno: string
  horario: string
  capacidade: number
  alunosAtivos: number
  vagasLivres: number
  ocupacaoPercent: number
  status: StatusVaga
}

function getStatusVaga(vagasLivres: number, capacidade: number): StatusVaga {
  if (vagasLivres <= 0) return 'LOTADA'
  if (vagasLivres / capacidade <= 0.2) return 'CRITICA'
  if (vagasLivres / capacidade <= 0.4) return 'ATENCAO'
  return 'OK'
}

export async function getVagasDashboard(): Promise<VagasTurma[]> {
  await requireAuth()

  const turmas = await prisma.turma.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      curso: true,
      turno: true,
      horario: true,
      capacidade: true,
      _count: {
        select: {
          alunos: { where: { situacaoMatricula: 'ATIVO' } },
          alunos2: { where: { situacaoMatricula: 'ATIVO' } },
        },
      },
    },
    orderBy: { curso: 'asc' },
  })

  return turmas.map((t: (typeof turmas)[number]) => {
    const cap = t.capacidade ?? 10
    const ativos = t._count.alunos + t._count.alunos2
    const livres = cap - ativos
    return {
      id: t.id,
      nome: t.nome,
      curso: t.curso,
      turno: t.turno,
      horario: t.horario,
      capacidade: cap,
      alunosAtivos: ativos,
      vagasLivres: livres,
      ocupacaoPercent: Math.round((ativos / cap) * 100),
      status: getStatusVaga(livres, cap),
    }
  })
}
