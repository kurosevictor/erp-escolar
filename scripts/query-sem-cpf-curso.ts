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
    WHERE a.cpf ILIKE '%sem_cpf%' AND a."deletedAt" IS NULL
    ORDER BY a.nome ASC
  `
  for (const r of rows) {
    const cursos = r.curso2
      ? `${r.curso} (${r.horario}) + ${r.curso2} (${r.horario2})`
      : `${r.curso} (${r.horario})`
    console.log(`${r.nome} — ${cursos}`)
  }
  console.log(`\nTotal: ${rows.length}`)
}

main().catch(console.error).finally(() => process.exit(0))
