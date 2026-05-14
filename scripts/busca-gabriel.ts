import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const mes = new Date().getMonth() + 1
  const ano = new Date().getFullYear()
  const hoje = new Date()

  // Busca por gabriel ou wortmeyer
  const rows = await p.$queryRaw<{ id: string; alunoId: string; nome: string; valor: number; pago: boolean }[]>`
    SELECT m.id, a.id as "alunoId", a.nome, m.valor, m.pago
    FROM "Mensalidade" m JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE (a.nome ILIKE '%gabriel%' OR a.nome ILIKE '%wortmeyer%')
      AND a."deletedAt" IS NULL AND m."deletedAt" IS NULL
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes} AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
  `

  console.log('Resultado busca gabriel/wortmeyer:', JSON.stringify(rows, null, 2))

  if (rows.length === 1 && !rows[0].pago) {
    const r = rows[0]
    await p.$executeRaw`
      UPDATE "Mensalidade"
      SET pago = true, "dataPagamento" = ${hoje}, valor = ${209.90}, "updatedAt" = ${hoje}
      WHERE id = ${r.id}
    `
    await p.$executeRaw`
      UPDATE "Aluno"
      SET "anotacaoFinanceiro" = ${'Pix Nubank - pago por Rodrigo Tolentino'}, "updatedAt" = ${hoje}
      WHERE id = ${r.alunoId}
    `
    console.log(`✅ Pago: ${r.nome} — R$ 209,90 | Pix Nubank - pago por Rodrigo Tolentino`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
