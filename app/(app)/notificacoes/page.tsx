import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Bell } from 'lucide-react'
import { NotificacoesClient } from './notificacoes-client'

export default async function NotificacoesPage() {
  const user = await requireAuth()

  const notificacoes = await prisma.notificacao.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
      </div>
      <NotificacoesClient initialData={notificacoes} />
    </div>
  )
}
