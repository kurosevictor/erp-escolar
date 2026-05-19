import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string; turmaId: string; turmaId2: string | null }[]>`
    SELECT nome, "turmaId", "turmaId2" FROM "Aluno" WHERE nome ILIKE '%kauann%' AND "deletedAt" IS NULL
  `
  console.log(JSON.stringify(rows, null, 2))
}

main().catch(console.error).finally(() => process.exit(0))
