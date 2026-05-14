import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ curso: string; turno: string; horario: string; alunos: number }[]>`
    SELECT t.curso, t.turno, t.horario, COUNT(a.id)::int as alunos
    FROM "Turma" t
    LEFT JOIN "Aluno" a ON a."turmaId" = t.id AND a."deletedAt" IS NULL AND a."situacaoMatricula" = 'ATIVO'
    WHERE t.ativo = true
    GROUP BY t.curso, t.turno, t.horario
    ORDER BY t.horario ASC, t.curso ASC
  `

  // Agrupa por dia
  const porDia = new Map<string, typeof rows>()
  for (const r of rows) {
    const dia = r.horario.split(' ')[0]
    if (!porDia.has(dia)) porDia.set(dia, [])
    porDia.get(dia)!.push(r)
  }

  const ordemDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  for (const dia of ordemDias) {
    const turmas = porDia.get(dia)
    if (!turmas) continue
    console.log(`\n── ${dia} ──`)
    for (const t of turmas) {
      console.log(`  ${t.horario.replace(dia + ' ', '')} | ${t.curso} (${t.turno}) — ${t.alunos} aluno${t.alunos !== 1 ? 's' : ''}`)
    }
  }
}

main().catch(console.error).finally(() => process.exit(0))
