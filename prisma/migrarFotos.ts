import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFile } from 'fs/promises'
import path from 'path'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'fotos-alunos'
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) throw new Error(`Erro ao criar bucket: ${error.message}`)
    console.log(`✅ Bucket "${BUCKET}" criado`)
  } else {
    console.log(`ℹ️  Bucket "${BUCKET}" já existe`)
  }
}

async function main() {
  await ensureBucket()

  // Busca alunos com foto local (/uploads/...)
  const alunos = await prisma.aluno.findMany({
    where: { foto: { startsWith: '/uploads/' } },
    select: { id: true, nome: true, foto: true }
  })

  console.log(`\n📁 ${alunos.length} alunos com foto local encontrados\n`)

  let sucesso = 0
  let erro = 0

  for (const aluno of alunos) {
    const filename = path.basename(aluno.foto!)
    const filepath = path.join(UPLOADS_DIR, filename)

    try {
      const buffer = await readFile(filepath)
      const ext = path.extname(filename)
      const contentType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png'

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filename, buffer, { contentType, upsert: true })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename)

      await prisma.aluno.update({
        where: { id: aluno.id },
        data: { foto: publicUrl }
      })

      console.log(`✅ ${aluno.nome}`)
      sucesso++
    } catch (e: any) {
      console.log(`❌ ${aluno.nome}: ${e.message}`)
      erro++
    }
  }

  console.log(`\n📊 Migrados: ${sucesso} | Erros: ${erro}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
