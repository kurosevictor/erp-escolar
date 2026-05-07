'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string | null
  link: string | null
  lida: boolean
  createdAt: Date
}

export function NotificacoesClient({ initialData }: { initialData: Notificacao[] }) {
  const [notificacoes, setNotificacoes] = useState(initialData)
  const [filtro, setFiltro] = useState<'todas' | 'nao-lidas'>('todas')
  const router = useRouter()

  const visiveis = filtro === 'nao-lidas' ? notificacoes.filter(n => !n.lida) : notificacoes

  async function marcarLida(n: Notificacao) {
    await fetch('/api/notificacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: n.id }),
    })
    setNotificacoes(prev => prev.map(x => x.id === n.id ? { ...x, lida: true } : x))
    if (n.link) router.push(n.link)
  }

  async function marcarTodas() {
    await fetch('/api/notificacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setNotificacoes(prev => prev.map(x => ({ ...x, lida: true })))
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`text-sm px-3 py-1.5 rounded-lg ${filtro === 'todas' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('nao-lidas')}
            className={`text-sm px-3 py-1.5 rounded-lg ${filtro === 'nao-lidas' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          >
            Não lidas {naoLidas > 0 && `(${naoLidas})`}
          </button>
        </div>
        {naoLidas > 0 && (
          <Button variant="ghost" size="sm" onClick={marcarTodas}>
            <Check className="w-3.5 h-3.5 mr-1" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {visiveis.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visiveis.map(n => (
            <button
              key={n.id}
              onClick={() => marcarLida(n)}
              className={`w-full text-left bg-card border rounded-xl px-5 py-4 hover:bg-accent transition-colors ${!n.lida ? 'border-blue-300 dark:border-blue-700' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className={`text-sm ${!n.lida ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {n.titulo}
                  </p>
                  {n.mensagem && <p className="text-sm text-muted-foreground mt-1">{n.mensagem}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                {!n.lida && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
