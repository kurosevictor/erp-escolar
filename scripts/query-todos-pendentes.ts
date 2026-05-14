import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const mes = new Date().getMonth() + 1
  const ano = new Date().getFullYear()

  const rows = await p.$queryRaw<{ nome: string; valor: number; vencimento: Date }[]>`
    SELECT a.nome, m.valor, m.vencimento
    FROM "Mensalidade" m
    JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m.pago = false
      AND m."deletedAt" IS NULL
      AND a."deletedAt" IS NULL
      AND a."situacaoMatricula" = 'ATIVO'
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
    ORDER BY m.vencimento ASC, a.nome ASC
  `

  let total = 0
  let diaAtual = 0
  console.log(`\n=== PENDENTES DE MAIO ${ano} ===\n`)

  for (const r of rows) {
    const dia = new Date(r.vencimento).getDate()
    if (dia !== diaAtual) {
      if (diaAtual !== 0) console.log()
      console.log(`── Dia ${dia} ──`)
      diaAtual = dia
    }
    console.log(`  ${r.nome} — R$ ${r.valor.toFixed(2).replace('.', ',')}`)
    total += r.valor
  }

  console.log(`\n─────────────────────────────`)
  console.log(`Total pendente: R$ ${total.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`)
  console.log(`Alunos em aberto: ${rows.length}`)
}

main().catch(console.error).finally(() => process.exit(0))
