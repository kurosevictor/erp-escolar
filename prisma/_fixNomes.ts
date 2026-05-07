import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
async function main() {
  const d = await prisma.aluno.updateMany({ where: { nome: 'Daniel Ferreira da Venda' }, data: { nome: 'Daniel Ferreira da Venda Filho' } })
  console.log('Daniel updated:', d.count)
}
main().catch(console.error).finally(() => prisma.$disconnect())
