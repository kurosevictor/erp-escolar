import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const n = await p.$executeRaw`
    UPDATE "Aluno" SET "deletedAt" = ${agora}, "updatedAt" = ${agora}
    WHERE nome ILIKE '%joão aparecido%' AND "deletedAt" IS NULL
  `
  console.log(`🗑️  João Aparecido removido (${n} registro)`)
}

main().catch(console.error).finally(() => process.exit(0))
