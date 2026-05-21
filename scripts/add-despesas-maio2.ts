import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const despesas = [
    { nome: 'Videos vladi',    valor: 200, diaVencimento: 20, pago: false, dataPagamento: null },
    { nome: 'Sucata',          valor: 60,  diaVencimento: 19, pago: true,  dataPagamento: new Date(2025, 4, 19) },
    { nome: 'Impulsionamento', valor: 150, diaVencimento: 19, pago: true,  dataPagamento: new Date(2025, 4, 19) },
  ]

  for (const d of despesas) {
    await prisma.despesa.create({ data: d })
    console.log(`OK: ${d.nome} R$${d.valor} ${d.pago ? 'PAGO' : 'PENDENTE'}`)
  }
}

main().finally(() => prisma.$disconnect())
