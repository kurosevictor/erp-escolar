import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const mes = new Date().getMonth() + 1
  const ano = new Date().getFullYear()

  const rows = await p.$queryRaw<{ dia: number; valor: number; pago: boolean }[]>`
    SELECT EXTRACT(DAY FROM m.vencimento)::int AS dia, m.valor, m.pago
    FROM "Mensalidade" m
    JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m."deletedAt" IS NULL
      AND a."deletedAt" IS NULL
      AND a."situacaoMatricula" = 'ATIVO'
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
      AND EXTRACT(DAY FROM m.vencimento) BETWEEN 1 AND 10
  `

  let totalSePagarTudo = 0
  let jaEntrou = 0
  let pendente = 0

  const porDia: Record<number, { total: number; pago: number; qtd: number; qtdPago: number }> = {}

  for (const r of rows) {
    totalSePagarTudo += r.valor
    porDia[r.dia] = porDia[r.dia] ?? { total: 0, pago: 0, qtd: 0, qtdPago: 0 }
    porDia[r.dia].total += r.valor
    porDia[r.dia].qtd++
    if (r.pago) {
      jaEntrou += r.valor
      porDia[r.dia].pago += r.valor
      porDia[r.dia].qtdPago++
    } else {
      pendente += r.valor
    }
  }

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

  console.log('\n=== INSIGHT: VENCIMENTOS DIA 1 A 10 ===\n')
  console.log('Dia | Alunos | Já pago        | Total se pagar tudo')
  console.log('----+--------+----------------+--------------------')
  for (let d = 1; d <= 10; d++) {
    const info = porDia[d]
    if (!info) continue
    console.log(
      `  ${String(d).padStart(2)} | ${String(info.qtdPago).padStart(2)}/${String(info.qtd).padStart(2)}   | ${fmt(info.pago).padStart(14)} | ${fmt(info.total).padStart(14)}`
    )
  }

  console.log('\n─────────────────────────────────────────────────')
  console.log(`✅ Já entrou no caixa:        ${fmt(jaEntrou)}`)
  console.log(`⏳ Ainda pendente:            ${fmt(pendente)}`)
  console.log(`🎯 Total se todos pagarem:    ${fmt(totalSePagarTudo)}`)
}

main().catch(console.error).finally(() => process.exit(0))
