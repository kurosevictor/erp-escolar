import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const nome = process.argv[2]

async function main() {
  if (!nome) { console.log('Uso: npx tsx scripts/set-inativo.ts "Nome do Aluno"'); return }
  const agora = new Date()
  const n = await p.$executeRaw`
    UPDATE "Aluno" SET "situacaoMatricula" = 'INATIVO', "updatedAt" = ${agora}
    WHERE nome ILIKE ${'%' + nome + '%'} AND "deletedAt" IS NULL
  `
  console.log(`Rows updated: ${n}`)
  console.log(`✅ ${nome} → INATIVO`)
}

main().catch(console.error).finally(() => process.exit(0))
