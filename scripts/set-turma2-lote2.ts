import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const agora = new Date()

async function main() {
  const turma = await p.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Turma" WHERE horario = 'Sábado 10:00–11:30' AND curso ILIKE '%informática%' LIMIT 1
  `
  if (!turma.length) { console.log('❌ Turma não encontrada'); return }
  const turmaId2 = turma[0].id

  for (const nome of ['laurany littman', 'laura emanuele', 'nilza']) {
    const n = await p.$executeRaw`
      UPDATE "Aluno" SET "turmaId2" = ${turmaId2}, "updatedAt" = ${agora}
      WHERE nome ILIKE ${'%' + nome + '%'} AND "deletedAt" IS NULL
    `
    console.log(`✅ ${nome} → Informática Sábado 10:00–11:30 (${n} reg)`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
