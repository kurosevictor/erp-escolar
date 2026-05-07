'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, Save, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notify } from '@/lib/toast'
import { StatusPresenca } from '@prisma/client'

interface Aluno { id: string; nome: string; foto: string | null }
interface Turma { id: string; nome: string; curso: string; turno: string; alunos: Aluno[] }
interface Presenca { alunoId: string; status: StatusPresenca; observacao: string | null }
interface Chamada { id: string; fechada: boolean; presencas: Presenca[] }

interface Props {
  turma: Turma
  chamadaExistente: Chamada | null
  userId: string
  userRole: string
  hoje: string
}

const STATUS_CONFIG = {
  PRESENTE: { label: 'Presente', icon: CheckCircle2, color: 'bg-green-500 text-white', outline: 'border-green-500 text-green-600' },
  AUSENTE: { label: 'Ausente', icon: XCircle, color: 'bg-red-500 text-white', outline: 'border-red-300 text-red-500' },
  JUSTIFICADO: { label: 'Justificado', icon: AlertCircle, color: 'bg-yellow-500 text-white', outline: 'border-yellow-400 text-yellow-600' },
  ATESTADO: { label: 'Atestado', icon: AlertCircle, color: 'bg-blue-500 text-white', outline: 'border-blue-400 text-blue-600' },
}

export function ChamadaClient({ turma, chamadaExistente, userId, userRole, hoje }: Props) {
  const router = useRouter()
  const [chamadaId, setChamadaId] = useState<string | null>(chamadaExistente?.id ?? null)
  const [fechada, setFechada] = useState(chamadaExistente?.fechada ?? false)
  const [presencas, setPresencas] = useState<Record<string, StatusPresenca>>(() => {
    const map: Record<string, StatusPresenca> = {}
    turma.alunos.forEach(a => { map[a.id] = StatusPresenca.AUSENTE })
    chamadaExistente?.presencas.forEach(p => { map[p.alunoId] = p.status })
    return map
  })
  const [observacoes, setObservacoes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    chamadaExistente?.presencas.forEach(p => { if (p.observacao) map[p.alunoId] = p.observacao })
    return map
  })
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function ensureChamada(): Promise<string> {
    if (chamadaId) return chamadaId
    const res = await fetch('/api/chamada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turmaId: turma.id, data: hoje, autorId: userId }),
    })
    const data = await res.json()
    setChamadaId(data.id)
    return data.id
  }

  const save = useCallback(async (alunoId: string, status: StatusPresenca, obs?: string) => {
    setSaveState('saving')
    try {
      const cId = await ensureChamada()
      await fetch('/api/chamada/presenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chamadaId: cId, alunoId, status, observacao: obs ?? null }),
      })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('idle')
      notify.error('Erro ao salvar presença')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamadaId, hoje, turma.id, userId])

  function setStatus(alunoId: string, status: StatusPresenca) {
    if (fechada) return
    setPresencas(prev => ({ ...prev, [alunoId]: status }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(alunoId, status, observacoes[alunoId]), 800)
  }

  function setObs(alunoId: string, obs: string) {
    if (fechada) return
    setObservacoes(prev => ({ ...prev, [alunoId]: obs }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(alunoId, presencas[alunoId], obs), 1000)
  }

  async function finalizar() {
    if (!chamadaId) { notify.error('Salve ao menos uma presença primeiro'); return }
    await fetch(`/api/chamada/${chamadaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechada: true }),
    })
    setFechada(true)
    notify.success('Chamada finalizada!')
    router.push('/chamada')
  }

  async function reabrir() {
    if (!chamadaId) return
    await fetch(`/api/chamada/${chamadaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechada: false }),
    })
    setFechada(false)
    notify.info('Chamada reaberta')
  }

  const presentes = Object.values(presencas).filter(s => s === 'PRESENTE' || s === 'JUSTIFICADO' || s === 'ATESTADO').length

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header fixo */}
      <div className="bg-card border rounded-xl p-4 sticky top-4 z-10 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => router.push('/chamada')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{turma.nome}</h1>
            <p className="text-sm text-muted-foreground">{presentes}/{turma.alunos.length} presentes</p>
          </div>
          <div className="flex items-center gap-2">
            {saveState === 'saving' && <span className="text-xs text-muted-foreground">Salvando...</span>}
            {saveState === 'saved' && <span className="text-xs text-green-600 flex items-center gap-1"><Save className="w-3 h-3" />Salvo</span>}
            {fechada ? (
              userRole === 'ADMIN' && (
                <Button size="sm" variant="outline" onClick={reabrir}>
                  <Unlock className="w-3.5 h-3.5 mr-1" /> Reabrir
                </Button>
              )
            ) : (
              <Button size="sm" onClick={finalizar}>
                <Lock className="w-3.5 h-3.5 mr-1" /> Finalizar
              </Button>
            )}
          </div>
        </div>
        {fechada && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 dark:bg-green-950/20 rounded-lg px-3 py-1.5 text-center">
            Chamada finalizada — modo leitura
          </div>
        )}
      </div>

      {/* Lista de alunos */}
      <div className="space-y-2">
        {turma.alunos.map((aluno) => {
          const status = presencas[aluno.id] ?? 'AUSENTE'
          const config = STATUS_CONFIG[status]
          const showObs = status === 'JUSTIFICADO' || status === 'ATESTADO'

          return (
            <div key={aluno.id} className="bg-card border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {aluno.foto
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={aluno.foto} alt={aluno.nome} className="w-10 h-10 rounded-full object-cover" />
                    : <span className="text-foreground font-bold text-sm">{aluno.nome.charAt(0)}</span>
                  }
                </div>
                <p className="font-medium text-foreground flex-1 min-w-0 truncate">{aluno.nome}</p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(STATUS_CONFIG) as StatusPresenca[]).map((s) => {
                  const cfg = STATUS_CONFIG[s]
                  const Icon = cfg.icon
                  const isActive = status === s
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(aluno.id, s)}
                      disabled={fechada}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                        isActive ? cfg.color : `border-border ${fechada ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-400'}`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:block">{cfg.label}</span>
                    </button>
                  )
                })}
              </div>

              {showObs && (
                <input
                  type="text"
                  value={observacoes[aluno.id] ?? ''}
                  onChange={e => setObs(aluno.id, e.target.value)}
                  disabled={fechada}
                  placeholder="Observação (motivo da justificativa)..."
                  className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Need useEffect import above
export { useEffect }
