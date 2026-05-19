import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  // Todas as turmas de inglês
  const turmas = await p.$queryRaw<{ id: string; nome: string; curso: string; horario: string }[]>`
    SELECT id, nome, curso, horario FROM "Turma" WHERE curso ILIKE '%ingl%' ORDER BY horario, nome
  `
  console.log('=== TURMAS ===')
  for (const t of turmas) console.log(`[${t.id}] ${t.nome} | curso: ${t.curso} | ${t.horario}`)

  // Todos os alunos de inglês com qual turma exata
  console.log('\n=== ALUNOS (turmaId) ===')
  const a1 = await p.$queryRaw<{ nome: string; turmaId: string; nomeTurma: string; curso: string }[]>`
    SELECT a.nome, a."turmaId", t.nome as "nomeTurma", t.curso
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId"
    WHERE t.curso ILIKE '%ingl%' AND a."deletedAt" IS NULL
    ORDER BY a.nome
  `
  for (const r of a1) console.log(`  ${r.nome} → [${r.turmaId}] ${r.nomeTurma} (${r.curso})`)

  console.log('\n=== ALUNOS (turmaId2) ===')
  const a2 = await p.$queryRaw<{ nome: string; turmaId2: string; nomeTurma: string; curso: string }[]>`
    SELECT a.nome, a."turmaId2", t.nome as "nomeTurma", t.curso
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId2"
    WHERE t.curso ILIKE '%ingl%' AND a."deletedAt" IS NULL
    ORDER BY a.nome
  `
  for (const r of a2) console.log(`  ${r.nome} → [${r.turmaId2}] ${r.nomeTurma} (${r.curso})`)
}

main().catch(console.error).finally(() => process.exit(0))
