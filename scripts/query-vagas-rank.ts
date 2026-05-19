import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ curso: string; horario: string; capacidade: number | null; alunos: number }[]>`
    SELECT t.curso, t.horario, t.capacidade,
      (
        COUNT(DISTINCT a1.id) FILTER (WHERE a1."deletedAt" IS NULL AND a1."situacaoMatricula" = 'ATIVO') +
        COUNT(DISTINCT a2.id) FILTER (WHERE a2."deletedAt" IS NULL AND a2."situacaoMatricula" = 'ATIVO')
      )::int as alunos
    FROM "Turma" t
    LEFT JOIN "Aluno" a1 ON a1."turmaId"  = t.id
    LEFT JOIN "Aluno" a2 ON a2."turmaId2" = t.id
    WHERE t.ativo = true
    GROUP BY t.curso, t.horario, t.capacidade
  `

  const ranked = rows
    .map(r => ({
      curso: r.curso,
      horario: r.horario,
      vagas: (r.capacidade ?? 10) - r.alunos,
    }))
    .sort((a, b) => a.vagas - b.vagas)

  for (const r of ranked) {
    console.log(`${r.vagas} vaga${r.vagas !== 1 ? 's' : ''} — ${r.curso} (${r.horario})`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
