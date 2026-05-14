import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string; curso: string; turno: string; horario: string; valorMensalidade: number | null; situacao: string }[]>`
    SELECT a.nome, t.curso, t.turno, t.horario, a."valorMensalidade", a."situacaoMatricula" as situacao
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId"
    WHERE a."deletedAt" IS NULL
      AND (a.nome ILIKE '%vitor%' OR a.nome ILIKE '%holderried%')
    ORDER BY a.nome
  `

  for (const r of rows) {
    console.log(`\n${r.nome}`)
    console.log(`  Curso: ${r.curso} | ${r.turno} — ${r.horario}`)
    console.log(`  Valor cadastrado: R$ ${r.valorMensalidade?.toFixed(2).replace('.', ',') ?? '—'}`)
    console.log(`  Situação: ${r.situacao}`)
  }

  const parcelas = await p.$queryRaw<{ nome: string; valor: number; pago: boolean; vencimento: Date }[]>`
    SELECT a.nome, m.valor, m.pago, m.vencimento
    FROM "Mensalidade" m JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE a."deletedAt" IS NULL AND m."deletedAt" IS NULL
      AND (a.nome ILIKE '%vitor%' OR a.nome ILIKE '%holderried%')
      AND EXTRACT(MONTH FROM m.vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM m.vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
    ORDER BY a.nome
  `

  console.log('\n--- Parcela maio ---')
  for (const r of parcelas) {
    console.log(`${r.nome}: R$ ${r.valor.toFixed(2).replace('.', ',')} | ${r.pago ? '✅ pago' : '⏳ pendente'} | venc: ${new Date(r.vencimento).toLocaleDateString('pt-BR')}`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
