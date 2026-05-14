import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string }[]>`
    SELECT nome FROM "Aluno"
    WHERE "deletedAt" IS NULL AND "situacaoMatricula" = 'ATIVO'
    ORDER BY nome ASC
  `
  rows.forEach(r => console.log(r.nome))
  console.log(`\nTotal: ${rows.length}`)
}

main().catch(console.error).finally(() => process.exit(0))
