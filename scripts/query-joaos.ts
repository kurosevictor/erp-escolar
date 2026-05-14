import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string; curso: string; turno: string; horario: string; valor: number; situacao: string }[]>`
    SELECT a.nome, t.curso, t.turno, t.horario, a."valorMensalidade" as valor, a."situacaoMatricula" as situacao
    FROM "Aluno" a JOIN "Turma" t ON t.id = a."turmaId"
    WHERE a."deletedAt" IS NULL
      AND (a.nome ILIKE '%joão vitor dos santos%' OR a.nome ILIKE '%joão victor holderried%')
  `
  for (const r of rows) {
    console.log(`\n${r.nome}`)
    console.log(`  Curso: ${r.curso}`)
    console.log(`  Turno/Horário: ${r.turno} — ${r.horario}`)
    console.log(`  Valor mensalidade: R$ ${r.valor?.toFixed(2).replace('.', ',') ?? '—'}`)
    console.log(`  Situação: ${r.situacao}`)
  }

  // Busca parcela mais recente de cada um
  const parcelas = await p.$queryRaw<{ nome: string; valor: number; pago: boolean; vencimento: Date }[]>`
    SELECT a.nome, m.valor, m.pago, m.vencimento
    FROM "Mensalidade" m JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE a."deletedAt" IS NULL AND m."deletedAt" IS NULL
      AND (a.nome ILIKE '%joão vitor dos santos%' OR a.nome ILIKE '%joão victor holderried%')
      AND EXTRACT(MONTH FROM m.vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM m.vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
  `
  console.log('\n--- Parcela de maio ---')
  for (const r of parcelas) {
    console.log(`${r.nome}: R$ ${r.valor.toFixed(2).replace('.', ',')} | ${r.pago ? '✅ pago' : '⏳ pendente'} | venc: ${new Date(r.vencimento).toLocaleDateString('pt-BR')}`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
