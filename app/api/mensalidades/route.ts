import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

// GET /api/mensalidades?mes=2026-05
export async function GET(request: NextRequest) {
  const mes = request.nextUrl.searchParams.get('mes') // ex: "2026-05"

  let query = supabase.from('Mensalidade').select('*').order('vencimento')

  if (mes) {
    const [ano, m] = mes.split('-').map(Number)
    const inicio = new Date(ano, m - 1, 1).toISOString()
    const fim = new Date(ano, m, 0, 23, 59, 59).toISOString()
    query = query.gte('vencimento', inicio).lte('vencimento', fim)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST /api/mensalidades  → gerar mensalidades do mês para todos os alunos ativos
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { mes, valor = 0 } = body // mes: "2026-05", valor: número

  if (!mes) return NextResponse.json({ error: 'Campo "mes" obrigatório (ex: 2026-05)' }, { status: 400 })

  const [ano, m] = mes.split('-').map(Number)
  const vencimento = new Date(ano, m - 1, 10).toISOString() // dia 10 do mês
  const numero = m

  // Busca alunos ativos
  const alunos = await prisma.aluno.findMany({
    where: { situacaoMatricula: 'ATIVO' },
    select: { id: true }
  })

  // Verifica quais já têm mensalidade nesse mês
  const inicio = new Date(ano, m - 1, 1).toISOString()
  const fim = new Date(ano, m, 0, 23, 59, 59).toISOString()
  const { data: existentes } = await supabase
    .from('Mensalidade')
    .select('alunoId')
    .gte('vencimento', inicio)
    .lte('vencimento', fim)

  const idsExistentes = new Set((existentes || []).map((e: any) => e.alunoId))
  const novos = alunos.filter(a => !idsExistentes.has(a.id))

  if (novos.length === 0) {
    return NextResponse.json({ criadas: 0, mensagem: 'Todos os alunos já têm mensalidade nesse mês.' })
  }

  const inserts = novos.map(a => ({
    alunoId: a.id,
    vencimento,
    pago: false,
    numero,
    valor,
  }))

  const { error } = await supabase.from('Mensalidade').insert(inserts)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ criadas: novos.length, puladas: idsExistentes.size })
}
