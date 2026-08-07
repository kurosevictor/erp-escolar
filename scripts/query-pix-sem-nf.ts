import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const rows = await p.$queryRaw<{ nome: string; anotacao: string; valor: number; nf: boolean }[]>`
    SELECT a.nome, a."anotacaoFinanceiro" as anotacao,
           m.valor, m."nfEmitida" as nf
    FROM "Aluno" a
    JOIN LATERAL (
      SELECT valor, "nfEmitida" FROM "Mensalidade"
      WHERE "alunoId" = a.id AND pago = true AND "deletedAt" IS NULL
      ORDER BY vencimento DESC LIMIT 1
    ) m ON true
    WHERE a."deletedAt" IS NULL
      AND LOWER(a."anotacaoFinanceiro") LIKE '%pix%nubank%'
      AND m."nfEmitida" = false
    ORDER BY a.nome ASC
  `
  console.log(`${rows.length} sem nota fiscal:`)
  rows.forEach((r, i) => {
    const val = Number(r.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    console.log(`${i+1}. ${r.nome} — R$${val} — ${r.anotacao}`)
  })
}
main().finally(() => p.$disconnect())
