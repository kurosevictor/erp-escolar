import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ id: string; nome: string; turmaId: string; turmaId2: string | null }[]>`
    SELECT id, nome, "turmaId", "turmaId2" FROM "Aluno" WHERE nome ILIKE '%renan%' AND "deletedAt" IS NULL
  `
  console.log('Renan encontrado:', JSON.stringify(rows, null, 2))

  if (!rows.length) { console.log('❌ Não encontrado'); return }

  // Busca turma Informática 08:30–10:00
  const turmas = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma" WHERE curso ILIKE '%informática%' AND horario = 'Sábado 08:30–10:00' LIMIT 1
  `
  console.log('Turma:', JSON.stringify(turmas, null, 2))
  if (!turmas.length) { console.log('❌ Turma não encontrada'); return }

  const turmaId = turmas[0].id
  const alunoId = rows[0].id
  const agora = new Date()

  const updated = await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${turmaId}, "turmaId2" = NULL, "updatedAt" = ${agora}
    WHERE id = ${alunoId}
  `
  console.log(`Rows updated: ${updated}`)
  console.log('✅ Renan Bueno → Informática Sábado 08:30–10:00 apenas')
}

main().catch(console.error).finally(() => process.exit(0))
