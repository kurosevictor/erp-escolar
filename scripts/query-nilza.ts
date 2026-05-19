import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string; curso: string; horario: string; curso2: string | null; horario2: string | null }[]>`
    SELECT a.nome, t.curso, t.horario, t2.curso as curso2, t2.horario as horario2
    FROM "Aluno" a
    JOIN "Turma" t ON t.id = a."turmaId"
    LEFT JOIN "Turma" t2 ON t2.id = a."turmaId2"
    WHERE a.nome ILIKE '%nilza%' AND a."deletedAt" IS NULL
  `
  for (const r of rows) {
    console.log(`${r.nome}`)
    console.log(`  Turma 1: ${r.curso} — ${r.horario}`)
    if (r.curso2) console.log(`  Turma 2: ${r.curso2} — ${r.horario2}`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
