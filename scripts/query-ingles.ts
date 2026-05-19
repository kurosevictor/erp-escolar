import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ horario: string; nome: string; via: string }[]>`
    SELECT t.horario, a.nome, 'principal' as via
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId"
    WHERE t.curso ILIKE '%ingl%' AND a."deletedAt" IS NULL AND a."situacaoMatricula" = 'ATIVO'
    UNION
    SELECT t.horario, a.nome, 'segunda turma' as via
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId2"
    WHERE t.curso ILIKE '%ingl%' AND a."deletedAt" IS NULL AND a."situacaoMatricula" = 'ATIVO'
    ORDER BY horario ASC, nome ASC
  `

  let horarioAtual = ''
  for (const r of rows) {
    if (r.horario !== horarioAtual) {
      const count = rows.filter(x => x.horario === r.horario).length
      console.log(`\n── ${r.horario} (${count} alunos) ──`)
      horarioAtual = r.horario
    }
    console.log(`  ${r.nome}${r.via === 'segunda turma' ? ' *' : ''}`)
  }
  console.log('\n* = segunda turma')
}

main().catch(console.error).finally(() => process.exit(0))
