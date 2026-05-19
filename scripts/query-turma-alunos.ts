import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string; via: string }[]>`
    SELECT a.nome, 'principal' as via
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId"
    WHERE t.horario = 'Sábado 10:00–11:30' AND t.curso ILIKE '%informática%'
      AND a."deletedAt" IS NULL AND a."situacaoMatricula" = 'ATIVO'
    UNION
    SELECT a.nome, 'segunda turma' as via
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId2"
    WHERE t.horario = 'Sábado 10:00–11:30' AND t.curso ILIKE '%informática%'
      AND a."deletedAt" IS NULL AND a."situacaoMatricula" = 'ATIVO'
    ORDER BY nome ASC
  `

  console.log(`\nInformática — Sábado 10:00–11:30 (${rows.length} alunos)\n`)
  rows.forEach((r, i) => console.log(`${i + 1}. ${r.nome} (${r.via})`))
}

main().catch(console.error).finally(() => process.exit(0))
