import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const turmas = await p.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Turma" WHERE curso ILIKE '%informática%' AND horario = 'Sábado 10:00–11:30' LIMIT 1
  `
  if (!turmas.length) { console.log('❌ Turma não encontrada'); return }
  const turmaId = turmas[0].id
  const agora = new Date()

  const n = await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${turmaId}, "turmaId2" = NULL, "updatedAt" = ${agora}
    WHERE nome ILIKE '%laura emanuele%' AND "deletedAt" IS NULL
  `
  console.log(`Rows updated: ${n}`)
  console.log('✅ Laura Emanuele → apenas Informática Sábado 10:00–11:30')
}

main().catch(console.error).finally(() => process.exit(0))
