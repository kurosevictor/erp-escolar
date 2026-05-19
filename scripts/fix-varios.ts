import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const INGLES_BASICO  = 'cmoss4fi6000bnsbmmvivrn9i' // Inglês Básico — Sábado 10:00–12:00
const INFO_830       = 'cmoss4gai000gnsbmma0lyamn'  // Informática — Sábado 08:30–10:00

async function main() {
  const agora = new Date()

  // Status disponíveis no sistema
  const status = await p.$queryRaw<{ situacaoMatricula: string }[]>`
    SELECT DISTINCT "situacaoMatricula" FROM "Aluno" WHERE "deletedAt" IS NULL
  `
  console.log('Status existentes:', status.map(s => s.situacaoMatricula))

  // 1. Kaue Maia → Mecânica de Carros Sábado 09:00–11:00
  const mecCarro = await p.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Turma" WHERE curso ILIKE '%mecânica de carro%' AND horario ILIKE '%sábado%' LIMIT 1
  `
  if (!mecCarro.length) { console.log('❌ Mecânica de Carros sábado não encontrada'); }
  else {
    await p.$executeRaw`
      UPDATE "Aluno" SET "turmaId" = ${mecCarro[0].id}, "updatedAt" = ${agora}
      WHERE nome = 'Kaue Maia' AND "deletedAt" IS NULL
    `
    console.log('✅ Kaue Maia → Mecânica de Carros Sábado')
  }

  // 2. Wendell → INATIVO (não ocupa vaga)
  await p.$executeRaw`
    UPDATE "Aluno" SET "situacaoMatricula" = 'INATIVO', "updatedAt" = ${agora}
    WHERE nome = 'Wendell' AND "deletedAt" IS NULL
  `
  console.log('✅ Wendell → INATIVO (não ocupa vaga)')

  // 3. Adrian Patrik → INATIVO
  await p.$executeRaw`
    UPDATE "Aluno" SET "situacaoMatricula" = 'INATIVO', "updatedAt" = ${agora}
    WHERE nome = 'Adrian Patrik' AND "deletedAt" IS NULL
  `
  console.log('✅ Adrian Patrik → INATIVO (não ocupa vaga)')

  // 4. Kauanny Maia → turmaId = Inglês Básico, turmaId2 = Informática 08:30
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${INGLES_BASICO}, "turmaId2" = ${INFO_830}, "updatedAt" = ${agora}
    WHERE nome = 'Kauanny Maia' AND "deletedAt" IS NULL
  `
  console.log('✅ Kauanny Maia → Inglês Básico + Informática 08:30')
}

main().catch(console.error).finally(() => process.exit(0))
