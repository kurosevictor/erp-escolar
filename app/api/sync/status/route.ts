import { NextResponse } from 'next/server'

export async function GET() {
  // ultimaSincronizacao removido do schema — retorna null por ora
  return NextResponse.json({ ultimaSincronizacao: null })
}
