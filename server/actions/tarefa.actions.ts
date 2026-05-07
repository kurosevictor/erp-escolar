'use server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const criarTarefaSchema = z.object({
  titulo: z.string().min(1).max(200),
  prazo: z.string().optional(),
})

export async function criarTarefa(formData: FormData) {
  const user = await requireAuth()
  const parsed = criarTarefaSchema.safeParse({
    titulo: formData.get('titulo'),
    prazo: formData.get('prazo') || undefined,
  })
  if (!parsed.success) throw new Error('Dados inválidos')

  await prisma.tarefa.create({
    data: {
      titulo: parsed.data.titulo,
      prazo: parsed.data.prazo ? new Date(parsed.data.prazo) : null,
      autorId: user.id,
    },
  })
  revalidatePath('/')
}

export async function concluirTarefa(id: string) {
  await requireAuth()
  await prisma.tarefa.update({
    where: { id },
    data: { concluida: true, concluidaEm: new Date() },
  })
  revalidatePath('/')
}

export async function reabrirTarefa(id: string) {
  await requireAuth()
  await prisma.tarefa.update({
    where: { id },
    data: { concluida: false, concluidaEm: null },
  })
  revalidatePath('/')
}

export async function deletarTarefa(id: string) {
  await requireAuth()
  await prisma.tarefa.delete({ where: { id } })
  revalidatePath('/')
}
