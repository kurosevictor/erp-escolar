import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { SYSTEM_PROMPT } from '@/lib/chat/schema-context'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

  const messages: Anthropic.MessageParam[] = [
    ...historico.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: pergunta },
  ]

  const sqlResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages,
  })

  const sql = sqlResponse.content[0].type === 'text'
    ? sqlResponse.content[0].text.trim()
    : ''

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

  const formatResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system:
      'Você é um assistente de uma escola profissionalizante chamada Futura. ' +
      'Responda em português brasileiro de forma direta e concisa, ' +
      'como se estivesse conversando com a secretaria da escola. ' +
      'Não mencione SQL nem banco de dados. ' +
      'Se os dados estiverem vazios, diga que não encontrou resultados.',
    messages: [{
      role: 'user',
      content: `Pergunta: "${pergunta}"\n\nDados: ${JSON.stringify(dados)}\n\nResponda a pergunta com base nos dados.`,
    }],
  })

  const resposta = formatResponse.content[0].type === 'text'
    ? formatResponse.content[0].text
    : 'Não consegui formatar a resposta.'

  return NextResponse.json({ resposta, sql, dados })
}
