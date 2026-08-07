import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const rows = await p.$queryRaw<{ nome: string; anotacao: string; valor: number }[]>`
    SELECT a.nome, a."anotacaoFinanceiro" as anotacao,
           COALESCE((
             SELECT m.valor FROM "Mensalidade" m
             WHERE m."alunoId" = a.id AND m.pago = true AND m."deletedAt" IS NULL
             ORDER BY m.vencimento DESC LIMIT 1
           ), a."valorMensalidade", 0) as valor
    FROM "Aluno" a
    WHERE a."deletedAt" IS NULL
      AND LOWER(a."anotacaoFinanceiro") LIKE '%pix%nubank%'
    ORDER BY a.nome ASC
  `
  rows.forEach((r, i) => {
    const val = Number(r.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    console.log(`${i+1}. ${r.nome} — R$${val} — ${r.anotacao}`)
  })
}
main().finally(() => p.$disconnect())
