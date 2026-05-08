import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { SYSTEM_PROMPT } from '@/lib/chat/schema-context'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const MODEL = 'llama-3.3-70b-versatile'

function isSafeQuery(sql: string): boolean {
  const upper = sql.trim().toUpperCase()
  if (!upper.startsWith('SELECT')) return false
  const blocked = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER',
    'CREATE', 'TRUNCATE', 'EXEC', '--', ';--']
  return !blocked.some(b => upper.includes(b))
}

interface HistoricoMsg {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  await requireAuth()

  const { pergunta, historico = [] } = (await req.json()) as {
    pergunta: string
    historico: HistoricoMsg[]
  }

  if (!pergunta || typeof pergunta !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' }, { status: 400 })
  }

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...historico.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: pergunta },
  ]

  const sqlResponse = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 500,
    messages,
  })

  const raw = sqlResponse.choices[0]?.message?.content?.trim() ?? ''
  // Remove markdown code blocks que o Llama costuma adicionar
  const sql = raw
    .replace(/^```(?:sql)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  if (sql === 'FORA_DO_ESCOPO') {
    return NextResponse.json({
      resposta: 'Não consigo responder isso com os dados disponíveis. ' +
        'Tente perguntar sobre alunos, parcelas, turmas ou frequência.',
      sql: null,
      dados: null,
    })
  }

  if (!isSafeQuery(sql)) {
    return NextResponse.json({
      resposta: 'Não posso executar esse tipo de operação.',
      sql: null,
      dados: null,
    })
  }

  let dados: unknown[]
  try {
    dados = await prisma.$queryRawUnsafe(sql)
  } catch {
    return NextResponse.json({
      resposta: 'Não consegui buscar esses dados. Tente reformular a pergunta.',
      sql,
      dados: null,
    })
  }

  const formatResponse = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content:
          'Você é um assistente de uma escola profissionalizante chamada Futura. ' +
          'Responda em português brasileiro de forma direta e concisa, ' +
          'como se estivesse conversando com a secretaria da escola. ' +
          'Não mencione SQL nem banco de dados. ' +
          'Se os dados estiverem vazios, diga que não encontrou resultados.',
      },
      {
        role: 'user',
        content: `Pergunta: "${pergunta}"\n\nDados: ${JSON.stringify(dados)}\n\nResponda a pergunta com base nos dados.`,
      },
    ],
  })

  const resposta = formatResponse.choices[0]?.message?.content ?? 'Não consegui formatar a resposta.'

  return NextResponse.json({ resposta, sql, dados })
}
