import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const hoje = new Date()

  const rows = await p.$queryRaw<{ nome: string; valor: number; vencimento: Date }[]>`
    SELECT a.nome, m.valor, m.vencimento
    FROM "Mensalidade" m JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m."deletedAt" IS NULL AND a."deletedAt" IS NULL
      AND a."situacaoMatricula" = 'ATIVO'
      AND m.pago = false
      AND m.vencimento < ${hoje}
    ORDER BY m.vencimento ASC, a.nome ASC
  `

  let total = 0
  let diaAtual = ''
  console.log(`\n=== VENCIDOS E NÃO PAGOS (até ${hoje.toLocaleDateString('pt-BR')}) ===\n`)

  for (const r of rows) {
    const dia = new Date(r.vencimento).toLocaleDateString('pt-BR')
    if (dia !== diaAtual) {
      if (diaAtual) console.log()
      console.log(`── Venceu ${dia} ──`)
      diaAtual = dia
    }
    console.log(`  ${r.nome} — R$ ${r.valor.toFixed(2).replace('.', ',')}`)
    total += r.valor
  }

  console.log(`\n─────────────────────────────`)
  console.log(`Total em aberto: R$ ${total.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`)
  console.log(`Parcelas vencidas: ${rows.length}`)
}

main().catch(console.error).finally(() => process.exit(0))
