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
        COUNT(DISTINCT a2.id) FILTER (WHERE a2."deletedAt" IS NULL AND a2."situacaoMatricula" = 'ATIVO') +
        COUNT(DISTINCT a3.id) FILTER (WHERE a3."deletedAt" IS NULL AND a3."situacaoMatricula" = 'ATIVO')
      )::int as alunos
    FROM "Turma" t
    LEFT JOIN "Aluno" a1 ON a1."turmaId"  = t.id
    LEFT JOIN "Aluno" a2 ON a2."turmaId2" = t.id
    LEFT JOIN "Aluno" a3 ON a3."turmaId3" = t.id
    WHERE t.ativo = true
    GROUP BY t.curso, t.horario, t.capacidade
    ORDER BY t.horario ASC, t.curso ASC
  `

  const ordemDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sábado']
  const porDia = new Map<string, typeof rows>()
  for (const r of rows) {
    const dia = r.horario.split(' ')[0]
    if (!porDia.has(dia)) porDia.set(dia, [])
    porDia.get(dia)!.push(r)
  }

  for (const dia of ordemDias) {
    const turmas = porDia.get(dia)
    if (!turmas) continue
    console.log(`\n── ${dia} ──`)
    for (const t of turmas) {
      const cap = t.capacidade ?? '?'
      const livres = t.capacidade != null ? t.capacidade - t.alunos : '?'
      const hora = t.horario.replace(dia + ' ', '')
      console.log(`  ${hora} | ${t.curso} — ${t.alunos}/${cap} alunos | 🟢 ${livres} vagas livres`)
    }
  }
}

main().catch(console.error).finally(() => process.exit(0))
