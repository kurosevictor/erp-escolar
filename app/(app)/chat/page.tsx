'use client'
import { useEffect, useRef, useState } from 'react'
import { Send, Trash2, Bot, User, Sparkles } from 'lucide-react'

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
  'Qual o valor total de mensalidades pagas esse mês?',
]

function BotDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

export default function ChatPage() {
  const [historico, setHistorico] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historico, loading])

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
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assistente IA</h1>
            <p className="text-sm text-muted-foreground">Faça perguntas sobre os dados da escola</p>
          </div>
        </div>
        {historico.length > 0 && (
          <button
            onClick={() => setHistorico([])}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar
          </button>
        )}
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto bg-card border rounded-xl p-4 space-y-4 mb-3">

        {historico.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
            <div className="text-center">
              <Bot className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="font-medium text-foreground">Como posso ajudar?</p>
              <p className="text-sm text-muted-foreground mt-1">Clique numa sugestão ou escreva sua pergunta</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGESTOES.map(s => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="text-left text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {historico.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.erro
                    ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400'
                    : 'bg-muted text-foreground'
                }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-muted-foreground'}`}>
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">
              Consultando... <BotDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
          placeholder="Faça uma pergunta sobre os dados da escola..."
          disabled={loading}
          className="flex-1 border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background disabled:opacity-50"
          autoFocus
        />
        <button
          onClick={() => enviar()}
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
