import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const INTERMEDIARIO = 'cmoss4fck000ansbmu11px78q'

async function main() {
  const agora = new Date()
  const n = await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${INTERMEDIARIO}, "updatedAt" = ${agora}
    WHERE nome = 'Bernardo Junkes' AND "deletedAt" IS NULL
  `
  console.log(`Rows updated: ${n}`)
  console.log('✅ Bernardo Junkes → Inglês Intermediário')
}

main().catch(console.error).finally(() => process.exit(0))
