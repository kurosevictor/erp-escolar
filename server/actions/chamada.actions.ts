'use server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { StatusPresenca } from '@prisma/client'

export async function getOrCreateChamada(turmaId: string, data: Date) {
  const user = await requireAuth()
  const dataInicio = new Date(data)
  dataInicio.setHours(0, 0, 0, 0)

  const existing = await prisma.chamada.findUnique({
    where: { turmaId_data: { turmaId, data: dataInicio } },
    include: {
      presencas: { include: { aluno: true } },
      turma: { include: { alunos: { where: { situacaoMatricula: 'ATIVO' } } } },
    },
  })

  if (existing) return existing

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: { alunos: { where: { situacaoMatricula: 'ATIVO' } } },
  })
  if (!turma) throw new Error('Turma não encontrada')

  const chamada = await prisma.chamada.create({
    data: {
      turmaId,
      data: dataInicio,
      autorId: user.id,
      presencas: {
        create: turma.alunos.map((a) => ({
          alunoId: a.id,
          status: StatusPresenca.AUSENTE,
        })),
      },
    },
    include: {
      presencas: { include: { aluno: true } },
      turma: { include: { alunos: { where: { situacaoMatricula: 'ATIVO' } } } },
    },
  })

  await audit({ action: 'CREATE', entity: 'Chamada', entityId: chamada.id, userId: user.id, userEmail: user.email })
  return chamada
}

export async function updatePresenca(
  chamadaId: string,
  alunoId: string,
  status: StatusPresenca,
  observacao?: string
) {
  const user = await requireAuth()
  const presenca = await prisma.presenca.upsert({
    where: { chamadaId_alunoId: { chamadaId, alunoId } },
    update: { status, observacao: observacao ?? null },
    create: { chamadaId, alunoId, status, observacao: observacao ?? null },
  })
  await audit({
    action: 'UPDATE',
    entity: 'Presenca',
    entityId: presenca.id,
    userId: user.id,
    userEmail: user.email,
    after: { status, observacao },
  })
  return presenca
}

export async function finalizarChamada(chamadaId: string) {
  const user = await requireAuth()
  await prisma.chamada.update({ where: { id: chamadaId }, data: { fechada: true } })
  await audit({ action: 'UPDATE', entity: 'Chamada', entityId: chamadaId, userId: user.id, userEmail: user.email, after: { fechada: true } })
  revalidatePath('/chamada')
}

export async function reabrirChamada(chamadaId: string) {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') throw new Error('Apenas admins podem reabrir chamadas')
  await prisma.chamada.update({ where: { id: chamadaId }, data: { fechada: false } })
  await audit({ action: 'UPDATE', entity: 'Chamada', entityId: chamadaId, userId: user.id, userEmail: user.email, after: { fechada: false } })
  revalidatePath('/chamada')
}

export async function getFrequenciaAluno(alunoId: string) {
  await requireAuth()
  const presencas = await prisma.presenca.findMany({
    where: { alunoId },
    include: { chamada: { include: { turma: true } } },
    orderBy: { chamada: { data: 'desc' } },
  })

  const total = presencas.length
  const presentes = presencas.filter((p) => p.status === StatusPresenca.PRESENTE || p.status === StatusPresenca.JUSTIFICADO).length
  const percentual = total > 0 ? Math.round((presentes / total) * 100) : 100

  return { presencas, total, presentes, percentual }
}
