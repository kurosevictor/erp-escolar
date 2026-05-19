import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const agora = new Date()

async function main() {
  const info830 = await p.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Turma" WHERE horario = 'Sábado 08:30–10:00' AND curso ILIKE '%informática%' LIMIT 1
  `
  if (!info830.length) { console.log('❌ Turma não encontrada'); return }
  const turmaId2 = info830[0].id

  // Busca por nome exato
  for (const nome of ['Kauanny Maia', 'Isabela Furlani']) {
    const aluno = await p.$queryRaw<{ id: string; nome: string; turmaId2: string | null }[]>`
      SELECT id, nome, "turmaId2" FROM "Aluno" WHERE nome = ${nome} AND "deletedAt" IS NULL LIMIT 1
    `
    if (!aluno.length) { console.log(`❌ ${nome} não encontrado`); continue }

    await p.$executeRaw`
      UPDATE "Aluno" SET "turmaId2" = ${turmaId2}, "updatedAt" = ${agora} WHERE id = ${aluno[0].id}
    `
    console.log(`✅ ${aluno[0].nome} → turmaId2 = Informática Sábado 08:30–10:00`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
