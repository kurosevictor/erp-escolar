'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { notify } from '@/lib/toast'
import { criarComunicado, atualizarComunicado } from '@/server/actions/comunicado.actions'
import { DestinatarioComunicado } from '@prisma/client'

const DESTINATARIOS = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'TURMA', label: 'Turma específica' },
  { value: 'RESPONSAVEIS', label: 'Responsáveis' },
  { value: 'PROFESSORES', label: 'Professores' },
  { value: 'STAFF', label: 'Equipe' },
]

interface Turma { id: string; nome: string }
interface Props {
  turmas: Turma[]
  inicial?: {
    id: string
    titulo: string
    corpo: string
    destinatario: DestinatarioComunicado
    turmaId: string | null
    fixado: boolean
  }
}

export function ComunicadoForm({ turmas, inicial }: Props) {
  const router = useRouter()
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [corpo, setCorpo] = useState(inicial?.corpo ?? '')
  const [destinatario, setDestinatario] = useState<DestinatarioComunicado>(inicial?.destinatario ?? 'TODOS')
  const [turmaId, setTurmaId] = useState(inicial?.turmaId ?? '')
  const [fixado, setFixado] = useState(inicial?.fixado ?? false)
  const [loading, setLoading] = useState(false)

  async function submit(publicar: boolean) {
    setLoading(true)
    try {
      const data = { titulo, corpo, destinatario, turmaId: destinatario === 'TURMA' ? turmaId : null, fixado, publicar }
      if (inicial) {
        await atualizarComunicado(inicial.id, data)
      } else {
        await criarComunicado(data)
      }
      notify.success(publicar ? 'Comunicado publicado!' : 'Rascunho salvo!')
      router.push('/comunicados')
    } catch {
      notify.error('Erro ao salvar comunicado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border rounded-xl p-6 space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Título</label>
        <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do comunicado" />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Conteúdo</label>
        <textarea
          value={corpo}
          onChange={e => setCorpo(e.target.value)}
          rows={6}
          placeholder="Escreva o comunicado aqui..."
          className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Destinatário</label>
          <select
            value={destinatario}
            onChange={e => setDestinatario(e.target.value as DestinatarioComunicado)}
            className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {DESTINATARIOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {destinatario === 'TURMA' && (
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Turma</label>
            <select
              value={turmaId}
              onChange={e => setTurmaId(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione...</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={fixado} onChange={e => setFixado(e.target.checked)} className="w-4 h-4 accent-primary" />
        <span className="text-sm text-foreground">Fixar no topo</span>
      </label>

      <div className="flex gap-3 pt-2 border-t border-border">
        <Button variant="outline" onClick={() => submit(false)} disabled={loading}>
          Salvar rascunho
        </Button>
        <Button onClick={() => submit(true)} disabled={loading}>
          Publicar agora
        </Button>
        <Button variant="ghost" onClick={() => router.back()} disabled={loading} className="ml-auto">
          Cancelar
        </Button>
      </div>
    </div>
  )
}
