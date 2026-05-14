import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const parcelas = await p.$queryRaw<{ nome: string; vencimento: Date; valor: number }[]>`
    SELECT a.nome, m.vencimento, m.valor
    FROM "Mensalidade" m
    JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m.pago = false
      AND m."deletedAt" IS NULL
      AND a."deletedAt" IS NULL
      AND a."situacaoMatricula" = 'ATIVO'
      AND EXTRACT(DAY FROM m.vencimento) = 10
    ORDER BY a.nome ASC
  `

  const unicos = new Map<string, { nome: string; valor: number }>()
  for (const p of parcelas) {
    if (!unicos.has(p.nome)) unicos.set(p.nome, { nome: p.nome, valor: p.valor })
  }

  console.log(`\nTotal de alunos com vencimento no dia 10 (não pagos): ${unicos.size}\n`)
  let i = 1
  for (const { nome, valor } of unicos.values()) {
    console.log(`${i}. ${nome} — R$ ${valor.toFixed(2).replace('.', ',')}`)
    i++
  }
}

main().catch(console.error).finally(() => process.exit(0))
