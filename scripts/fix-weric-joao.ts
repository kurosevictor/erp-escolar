import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()

  const mecMoto = await p.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Turma" WHERE curso ILIKE '%mecânica de moto%' AND horario ILIKE '%sábado%' LIMIT 1
  `
  if (!mecMoto.length) { console.log('❌ Turma Mecânica de Motos Sábado não encontrada'); return }

  const n1 = await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${mecMoto[0].id}, "updatedAt" = ${agora}
    WHERE nome ILIKE '%weric%' AND "deletedAt" IS NULL
  `
  console.log(`Rows: ${n1} — ✅ Weric → Mecânica de Motos Sábado`)

  const n2 = await p.$executeRaw`
    UPDATE "Aluno" SET "situacaoMatricula" = 'INATIVO', "updatedAt" = ${agora}
    WHERE nome = 'João Pinto' AND "deletedAt" IS NULL
  `
  console.log(`Rows: ${n2} — ✅ João Pinto → INATIVO`)
}

main().catch(console.error).finally(() => process.exit(0))
