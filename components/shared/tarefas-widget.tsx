'use client'
import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import { notify } from '@/lib/toast'

interface Tarefa {
  id: string
  titulo: string
  concluida: boolean
  prazo: string | null
}

export function TarefasWidget() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [nova, setNova] = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/tarefas')
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then(d => { setTarefas(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function adicionar() {
    const titulo = nova.trim()
    if (!titulo) return
    setNova('')
    const res = await fetch('/api/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo }),
    })
    const t = await res.json()
    setTarefas(prev => [t, ...prev])
  }

  async function concluir(id: string, concluida: boolean) {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida } : t))
    await fetch(`/api/tarefas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concluida }),
    })
    if (concluida) notify.success('Tarefa concluída!')
  }

  async function deletar(id: string) {
    setTarefas(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/tarefas/${id}`, { method: 'DELETE' })
  }

  const visiveis = tarefas.filter(t => !t.concluida).slice(0, 5)

  return (
    <div className="bg-card rounded-xl border p-5">
      <h2 className="font-semibold text-foreground mb-4">Tarefas da Secretaria</h2>

      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={nova}
          onChange={e => setNova(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()}
          placeholder="Nova tarefa... (Enter para salvar)"
          className="flex-1 text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={adicionar}
          className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : visiveis.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma tarefa pendente 🎉</p>
      ) : (
        <div className="space-y-2">
          {visiveis.map(t => (
            <div key={t.id} className="flex items-center gap-3 group p-2 rounded-lg hover:bg-accent transition-colors">
              <button onClick={() => concluir(t.id, !t.concluida)} className="shrink-0">
                {t.concluida
                  ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                  : <Circle className="w-5 h-5 text-muted-foreground" />
                }
              </button>
              <span className={`flex-1 text-sm ${t.concluida ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {t.titulo}
              </span>
              {t.prazo && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(t.prazo).toLocaleDateString('pt-BR')}
                </span>
              )}
              <button onClick={() => deletar(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {tarefas.filter(t => !t.concluida).length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{tarefas.filter(t => !t.concluida).length - 5} tarefas a mais
            </p>
          )}
        </div>
      )}
    </div>
  )
}
