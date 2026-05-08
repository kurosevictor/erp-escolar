import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CheckCircle2, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function ChamadaPage() {
  await requireAuth()

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const turmas = await prisma.turma.findMany({
    where: { ativo: true },
    include: {
      chamadas: { where: { data: hoje }, select: { id: true, fechada: true } },
      _count: { select: { alunos: { where: { situacaoMatricula: 'ATIVO' } } } },
    },
    orderBy: { nome: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Chamada</h1>
        <p className="text-muted-foreground mt-1">
          {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {turmas.map((turma: (typeof turmas)[number]) => {
          const chamadaHoje = turma.chamadas[0]
          const feita = !!chamadaHoje
          const fechada = chamadaHoje?.fechada ?? false

          return (
            <div key={turma.id} className="bg-card rounded-xl border p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{turma.nome}</h3>
                  <p className="text-sm text-muted-foreground">{turma.curso} · {turma.turno}</p>
                </div>
                {fechada ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Fechada
                  </Badge>
                ) : feita ? (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    <Clock className="w-3 h-3 mr-1" /> Em andamento
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
                    <Clock className="w-3 h-3 mr-1" /> Pendente
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{turma._count.alunos} alunos ativos</span>
              </div>

              <Link
                href={`/chamada/${turma.id}`}
                className={`w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                  fechada
                    ? 'bg-muted text-muted-foreground hover:bg-accent'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {fechada ? 'Ver chamada' : feita ? 'Continuar chamada' : 'Registrar chamada'}
              </Link>
            </div>
          )
        })}
      </div>

      {turmas.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma turma cadastrada</p>
        </div>
      )}
    </div>
  )
}
