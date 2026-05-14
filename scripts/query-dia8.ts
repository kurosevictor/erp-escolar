import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const mes = new Date().getMonth() + 1
  const ano = new Date().getFullYear()

  const parcelas = await p.$queryRaw<{ nome: string; valor: number }[]>`
    SELECT a.nome, m.valor
    FROM "Mensalidade" m
    JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m.pago = false
      AND m."deletedAt" IS NULL
      AND a."deletedAt" IS NULL
      AND a."situacaoMatricula" = 'ATIVO'
      AND EXTRACT(DAY FROM m.vencimento) = 8
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
    ORDER BY a.nome ASC
  `

  console.log(`\nTotal pendentes dia 8: ${parcelas.length}\n`)
  parcelas.sort((a, b) => a.nome.localeCompare(b.nome))
  parcelas.forEach((p, i) => {
    console.log(`${i + 1}. ${p.nome} — R$ ${p.valor.toFixed(2).replace('.', ',')}`)
  })
}

main().catch(console.error).finally(() => process.exit(0))
