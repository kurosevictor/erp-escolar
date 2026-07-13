import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'contratos'

export async function GET(request: NextRequest) {
  await requireAuth()

  const nome = request.nextUrl.searchParams.get('nome')
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(nome, 3600)

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 })

  return NextResponse.json({ url: data.signedUrl })
}
