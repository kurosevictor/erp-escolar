import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const n = await p.$executeRaw`
    UPDATE "Aluno" SET "deletedAt" = ${agora}, "updatedAt" = ${agora}
    WHERE nome ILIKE '%rodrileico%' AND "deletedAt" IS NULL
  `
  console.log(`🗑️  Rodrileico removido (${n} registro)`)
}

main().catch(console.error).finally(() => process.exit(0))
