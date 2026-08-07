import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const rows = await p.$queryRaw<{ nome: string; anotacao: string }[]>`
    SELECT nome, "anotacaoFinanceiro" as anotacao
    FROM "Aluno"
    WHERE "deletedAt" IS NULL
      AND LOWER("anotacaoFinanceiro") LIKE '%pix%nubank%'
    ORDER BY nome ASC
  `
  console.log(`${rows.length} resultado(s):`)
  rows.forEach(r => console.log(` ${r.nome} — ${r.anotacao}`))
}
main().finally(() => p.$disconnect())
