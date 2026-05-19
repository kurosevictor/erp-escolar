import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string; cpf: string }[]>`
    SELECT nome, cpf FROM "Aluno"
    WHERE cpf ILIKE '%sem_cpf%' AND "deletedAt" IS NULL
    ORDER BY nome ASC
  `
  for (const r of rows) console.log(r.nome)
  console.log(`\nTotal: ${rows.length}`)
}

main().catch(console.error).finally(() => process.exit(0))
