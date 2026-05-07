import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PATCH /api/mensalidades/[id]  → { pago: true | false }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const updates: Record<string, unknown> = {}
  if ('pago' in body) updates.pago = body.pago
  if ('nfEmitida' in body) updates.nfEmitida = body.nfEmitida

  const { data, error } = await supabase
    .from('Mensalidade')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
