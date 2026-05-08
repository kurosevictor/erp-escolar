import { requireAuth, can } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Pin, Plus, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const DEST_LABELS: Record<string, string> = {
  TODOS: 'Todos',
  TURMA: 'Turma',
  RESPONSAVEIS: 'Responsáveis',
  PROFESSORES: 'Professores',
  STAFF: 'Equipe',
}

export default async function ComunicadosPage() {
  const user = await requireAuth()
  const podeGerenciar = can(user.role, 'comunicado.create')

  const comunicados = await prisma.comunicado.findMany({
    where: { deletedAt: null, rascunho: false },
    include: {
      autor: { select: { nome: true } },
      turma: { select: { nome: true } },
    },
    orderBy: [{ fixado: 'desc' }, { publicadoEm: 'desc' }],
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunicados</h1>
          <p className="text-muted-foreground mt-1">{comunicados.length} publicados</p>
        </div>
        {podeGerenciar && (
          <div className="flex gap-2">
            <Link href="/comunicados/rascunhos" className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium transition-colors">
              Rascunhos
            </Link>
            <Link href="/comunicados/novo" className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Novo
            </Link>
          </div>
        )}
      </div>

      {comunicados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium">Nenhum comunicado publicado</p>
          {podeGerenciar && (
            <Link href="/comunicados/novo" className="inline-flex items-center h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium transition-colors">
              Criar comunicado
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {comunicados.map((c: (typeof comunicados)[number]) => (
            <div key={c.id} className={`bg-card border rounded-xl p-5 ${c.fixado ? 'border-blue-300 dark:border-blue-700' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {c.fixado && <Pin className="w-4 h-4 text-blue-500 shrink-0" />}
                    <h3 className="font-semibold text-foreground truncate">{c.titulo}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.corpo}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant="secondary">{DEST_LABELS[c.destinatario]}</Badge>
                  {c.turma && <span className="text-xs text-muted-foreground">{c.turma.nome}</span>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Por {c.autor.nome} · {c.publicadoEm ? new Date(c.publicadoEm).toLocaleDateString('pt-BR') : ''}
                </span>
                {podeGerenciar && (
                  <Link href={`/comunicados/${c.id}/editar`} className="text-xs text-muted-foreground hover:text-foreground">
                    Editar
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
