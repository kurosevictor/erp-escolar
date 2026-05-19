import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const n = await p.$executeRaw`
    UPDATE "Turma" SET capacidade = 15, "updatedAt" = ${agora}
    WHERE curso ILIKE '%mecânica de carro%'
  `
  console.log(`Rows updated: ${n} — ✅ Mecânica de Carros → capacidade 15`)
}

main().catch(console.error).finally(() => process.exit(0))
