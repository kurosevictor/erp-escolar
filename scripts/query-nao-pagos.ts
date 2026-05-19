import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const mes = agora.getMonth() + 1
  const ano = agora.getFullYear()

  const rows = await p.$queryRaw<{ nome: string; valor: number; vencimento: Date; diaVencimento: number }[]>`
    SELECT a.nome, m.valor, m.vencimento, a."diaVencimento"
    FROM "Mensalidade" m
    JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m.pago = false
      AND m."deletedAt" IS NULL
      AND a."deletedAt" IS NULL
      AND a."situacaoMatricula" = 'ATIVO'
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
    ORDER BY a."diaVencimento" ASC, a.nome ASC
  `

  let diaAtual = 0
  for (const r of rows) {
    if (r.diaVencimento !== diaAtual) {
      const count = rows.filter(x => x.diaVencimento === r.diaVencimento).length
      console.log(`\n── Vencimento dia ${r.diaVencimento} (${count} pendentes) ──`)
      diaAtual = r.diaVencimento
    }
    const valor = r.valor === 0 ? 'R$0' : `R$${r.valor.toFixed(2).replace('.', ',')}`
    const atrasado = new Date(r.vencimento) < agora ? ' ⚠️' : ''
    console.log(`  ${r.nome} — ${valor}${atrasado}`)
  }

  console.log(`\nTotal: ${rows.length} pendentes`)
}

main().catch(console.error).finally(() => process.exit(0))
