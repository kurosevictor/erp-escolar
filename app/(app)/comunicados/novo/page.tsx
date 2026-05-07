import { requireAuth, can } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ComunicadoForm } from '@/components/shared/comunicado-form'

export default async function NovoComunicadoPage() {
  const user = await requireAuth()
  if (!can(user.role, 'comunicado.create')) redirect('/nao-autorizado')

  const turmas = await prisma.turma.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Novo Comunicado</h1>
      <ComunicadoForm turmas={turmas} />
    </div>
  )
}
