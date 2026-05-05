import { NextResponse } from 'next/server'
import { syncAllSheets } from '@/lib/syncSheets'

export async function POST() {
  try {
    const result = await syncAllSheets()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
