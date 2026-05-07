import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ChamadaClient } from './chamada-client'

export default async function ChamadaTurmaPage({ params }: { params: Promise<{ turmaId: string }> }) {
  const { turmaId } = await params
  const user = await requireAuth()

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    include: {
      alunos: {
        where: { situacaoMatricula: 'ATIVO' },
        orderBy: { nome: 'asc' },
      },
    },
  })
  if (!turma) notFound()

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const chamadaExistente = await prisma.chamada.findUnique({
    where: { turmaId_data: { turmaId, data: hoje } },
    include: { presencas: true },
  })

  return (
    <ChamadaClient
      turma={turma}
      chamadaExistente={chamadaExistente}
      userId={user.id}
      userRole={user.role}
      hoje={hoje.toISOString()}
    />
  )
}
