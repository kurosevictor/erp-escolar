import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const n = await p.$executeRaw`
    UPDATE "Turma" SET capacidade = 5, "updatedAt" = ${agora}
    WHERE curso ILIKE '%inglês kids%'
  `
  console.log(`Rows updated: ${n} — ✅ Inglês Kids → capacidade 5`)
}

main().catch(console.error).finally(() => process.exit(0))
