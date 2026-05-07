'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notificacao {
  id: string
  titulo: string
  mensagem: string | null
  link: string | null
  lida: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notificacoes?limit=10')
      if (!res.ok) return
      const data = await res.json()
      setNotificacoes(data.notificacoes ?? [])
      setTotal(data.totalNaoLidas ?? 0)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [load])

  async function marcarLida(n: Notificacao) {
    await fetch('/api/notificacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: n.id }),
    })
    setNotificacoes((prev) => prev.map((x) => x.id === n.id ? { ...x, lida: true } : x))
    setTotal((v) => Math.max(0, v - 1))
    if (n.link) { router.push(n.link); setOpen(false) }
  }

  async function marcarTodas() {
    await fetch('/api/notificacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setNotificacoes((prev) => prev.map((x) => ({ ...x, lida: true })))
    setTotal(0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
        <Bell className="h-4 w-4" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-semibold text-sm">Notificações</p>
          {total > 0 && (
            <button onClick={marcarTodas} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Check className="w-3 h-3" /> Marcar todas
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notificacoes.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhuma notificação</p>
          ) : (
            notificacoes.map((n) => (
              <button
                key={n.id}
                onClick={() => marcarLida(n)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-accent transition-colors ${!n.lida ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
              >
                <p className={`text-sm ${!n.lida ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>
                  {n.titulo}
                </p>
                {n.mensagem && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.mensagem}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border">
          <button onClick={() => { router.push('/notificacoes'); setOpen(false) }} className="w-full text-xs text-muted-foreground hover:text-foreground py-1">
            Ver todas
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
