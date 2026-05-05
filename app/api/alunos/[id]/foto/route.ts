import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const formData = await request.formData()
  const file = formData.get('foto') as File

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const filename = `${id}-${Date.now()}${path.extname(file.name)}`
  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)

  const aluno = await prisma.aluno.update({
    where: { id },
    data: { foto: `/uploads/${filename}` },
  })

  return NextResponse.json({ foto: aluno.foto })
}
