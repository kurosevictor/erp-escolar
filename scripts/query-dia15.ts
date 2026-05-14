import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const mes = new Date().getMonth() + 1
  const ano = new Date().getFullYear()

  const rows = await p.$queryRaw<{ nome: string; valor: number; pago: boolean }[]>`
    SELECT a.nome, m.valor, m.pago
    FROM "Mensalidade" m JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m."deletedAt" IS NULL AND a."deletedAt" IS NULL
      AND a."situacaoMatricula" = 'ATIVO'
      AND EXTRACT(DAY FROM m.vencimento) = 15
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
    ORDER BY a.nome ASC
  `

  const pagos = rows.filter(r => r.pago)
  const pendentes = rows.filter(r => !r.pago)

  console.log(`\n=== DIA 15 — MAIO ${ano} ===\n`)

  if (pendentes.length) {
    console.log(`⏳ Pendentes (${pendentes.length}):`)
    pendentes.forEach((r, i) => console.log(`  ${i + 1}. ${r.nome} — R$ ${r.valor.toFixed(2).replace('.', ',')}`))
  }

  if (pagos.length) {
    console.log(`\n✅ Já pagos (${pagos.length}):`)
    pagos.forEach((r, i) => console.log(`  ${i + 1}. ${r.nome} — R$ ${r.valor.toFixed(2).replace('.', ',')}`))
  }
}

main().catch(console.error).finally(() => process.exit(0))
