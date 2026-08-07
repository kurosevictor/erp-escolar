import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const hoje = new Date('2026-05-22')
  const despesas = [
    { nome: 'Plano internet',   valor: 220, diaVencimento: 22 },
    { nome: 'Impressora',       valor: 326, diaVencimento: 22 },
    { nome: 'Declaracao',       valor: 150, diaVencimento: 22 },
    { nome: 'Impulsionamento',  valor: 120, diaVencimento: 22 },
  ]
  for (const d of despesas) {
    await p.despesa.create({ data: { ...d, pago: true, dataPagamento: hoje } })
    console.log(`OK: ${d.nome} R$${d.valor} — PAGO`)
  }
}
main().catch(console.error).finally(() => p.$disconnect())
