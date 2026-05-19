import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const agora = new Date()

async function getTurma(horario: string) {
  const rows = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma" WHERE horario = ${horario} AND curso ILIKE '%informática%' LIMIT 1
  `
  return rows[0] ?? null
}

async function main() {
  const info830 = await getTurma('Sábado 08:30–10:00')
  const info1000 = await getTurma('Sábado 10:00–11:30')

  if (!info830 || !info1000) { console.log('❌ Turmas não encontradas'); return }

  // Nilza: só faz Informática 10:00–11:30 → turmaId = 10:00, turmaId2 = null
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${info1000.id}, "turmaId2" = NULL, "updatedAt" = ${agora}
    WHERE nome ILIKE '%nilza%' AND "deletedAt" IS NULL
  `
  console.log('✅ Nilza → apenas Informática Sábado 10:00–11:30')

  // Renan Bueno: turma2 = Informática 08:30–10:00
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId2" = ${info830.id}, "updatedAt" = ${agora}
    WHERE nome ILIKE '%renan bueno%' AND "deletedAt" IS NULL
  `
  console.log('✅ Renan Bueno → +Informática Sábado 08:30–10:00 (segunda turma)')

  // Kauany Maia: turma2 = Informática 08:30–10:00
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId2" = ${info830.id}, "updatedAt" = ${agora}
    WHERE nome ILIKE '%kauany%' AND "deletedAt" IS NULL
  `
  console.log('✅ Kauanny Maia → +Informática Sábado 08:30–10:00 (segunda turma)')

  // Isabela Furlani: turma2 = Informática 08:30–10:00
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId2" = ${info830.id}, "updatedAt" = ${agora}
    WHERE nome ILIKE '%isabela furlani%' AND "deletedAt" IS NULL
  `
  console.log('✅ Isabela Furlani → +Informática Sábado 08:30–10:00 (segunda turma)')
}

main().catch(console.error).finally(() => process.exit(0))
