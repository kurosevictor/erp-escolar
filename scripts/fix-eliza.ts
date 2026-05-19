import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const turmas = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma" WHERE curso ILIKE '%admin%' LIMIT 1
  `
  if (!turmas.length) { console.log('❌ Turma de Administração não encontrada'); return }
  const turma = turmas[0]
  console.log(`Turma encontrada: ${turma.curso} — ${turma.horario}`)

  const agora = new Date()
  const n = await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId2" = ${turma.id}, "updatedAt" = ${agora}
    WHERE nome ILIKE '%eliza cristina%' AND "deletedAt" IS NULL
  `
  console.log(`Rows updated: ${n}`)
  console.log('✅ Eliza Cristina → +Administração como segunda turma')
}

main().catch(console.error).finally(() => process.exit(0))
