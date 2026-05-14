import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const agora = new Date()

async function getTurmaExata(curso: string, horario: string) {
  const rows = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma"
    WHERE curso ILIKE ${'%' + curso + '%'} AND horario = ${horario} AND ativo = true
    LIMIT 1
  `
  if (!rows.length) { console.log(`❌ Turma não encontrada: ${curso} / ${horario}`); return null }
  return rows[0]
}

async function corrigirTurma2(nomeAluno: string, turmaId2Horario: string, curso2: string) {
  const turma2 = await getTurmaExata(curso2, turmaId2Horario)
  if (!turma2) return

  const n = await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId2" = ${turma2.id}, "updatedAt" = ${agora}
    WHERE nome ILIKE ${'%' + nomeAluno + '%'} AND "deletedAt" IS NULL
  `
  console.log(`✅ ${nomeAluno} → turma2: ${turma2.curso} — ${turma2.horario} (${n} reg)`)
}

async function main() {
  // Milena: Inglês Sábado 10:00–12:00
  await corrigirTurma2('Milena Bender', 'Sábado 10:00–12:00', 'Inglês')

  // Felipe Quadra: Informática Sábado 10:00–11:30
  await corrigirTurma2('Felipe Quadra', 'Sábado 10:00–11:30', 'Informática')

  // Kauan Richter: Inglês Sábado 10:00–12:00
  await corrigirTurma2('Kauan Richter', 'Sábado 10:00–12:00', 'Inglês')

  // Nicolas Eduardo: Inglês Sábado 10:00–12:00
  await corrigirTurma2('Nicolas Eduardo', 'Sábado 10:00–12:00', 'Inglês')

  console.log('\n✅ Correções aplicadas')
}

main().catch(console.error).finally(() => process.exit(0))
