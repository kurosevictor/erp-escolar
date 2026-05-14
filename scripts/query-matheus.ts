import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ id: string; vencimento: Date; valor: number; pago: boolean; dataPagamento: Date | null }[]>`
    SELECT m.id, m.vencimento, m.valor, m.pago, m."dataPagamento"
    FROM "Mensalidade" m
    JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE a.nome ILIKE '%matheus vinicius%'
      AND a."deletedAt" IS NULL
      AND m."deletedAt" IS NULL
    ORDER BY m.vencimento DESC
    LIMIT 5
  `
  console.log(JSON.stringify(rows, null, 2))
}

main().catch(console.error).finally(() => process.exit(0))
