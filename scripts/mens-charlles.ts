import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
async function main() {
  await prisma.parcela.create({
    data: {
      numero: 1,
      valor: 2130,
      vencimento: new Date('2025-05-10'),
      pago: true,
      dataPagamento: new Date('2025-05-21'),
      alunoId: '5e99f213-4817-4011-9403-6c72840d6941',
    }
  })
  console.log('Mensalidade maio R$2130 - PAGO')
}
main().finally(() => prisma.$disconnect())
