'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Trash2, Bot, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  erro?: boolean
}

const SUGESTOES = [
  'Quantos alunos estão inadimplentes?',
  'Qual turma tem mais faltas esse mês?',
  'Quantas vagas livres tem no curso de solda?',
  'Quais alunos têm parcela vencendo essa semana?',
  'Quantos alunos ativos temos no total?',
]

function BotDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

export function ChatAssistant({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [historico, setHistorico] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historico, loading])

  if (!enabled) return null

  async function enviar(pergunta?: string) {
    const texto = (pergunta ?? input).trim()
    if (!texto || loading) return
    setInput('')

    const msgUsuario: Message = { role: 'user', content: texto, timestamp: new Date() }
    setHistorico(h => [...h, msgUsuario])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: texto,
          historico: historico.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json() as { resposta: string }
      setHistorico(h => [...h, {
        role: 'assistant',
        content: data.resposta ?? 'Sem resposta.',
        timestamp: new Date(),
      }])
    } catch {
      setHistorico(h => [...h, {
        role: 'assistant',
        content: 'Erro ao conectar. Tente novamente.',
        timestamp: new Date(),
        erro: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  function limpar() {
    setHistorico([])
  }

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Perguntar</span>
        </button>
      )}

      {/* Painel de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[520px] bg-white rounded-xl shadow-2xl border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-4 h-4" />
              <span className="font-semibold text-sm">Assistente de dados</span>
            </div>
            <div className="flex items-center gap-2">
              {historico.length > 0 && (
                <button onClick={limpar} title="Limpar conversa" className="text-blue-200 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-blue-200 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {historico.length === 0 && !loading && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 text-center">Clique para perguntar:</p>
                {SUGESTOES.map(s => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors border border-blue-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {historico.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.erro
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-500">
                  Consultando... <BotDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
              placeholder="Faça uma pergunta..."
              disabled={loading}
              className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={() => enviar()}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
