import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
async function main() {
  const d = await prisma.aluno.updateMany({
    where: { nome: 'Daniel Ferreira da Venda Filho' },
    data: { cpf: '494.789.598.59', email: 'camilaedaniel02@hotmail.com', telefone: '47996383263', dataNascimento: new Date('2000-02-23') }
  })
  const t = await prisma.aluno.updateMany({
    where: { nome: 'Thiago Aramis Balsanelli' },
    data: { cpf: '130.053.739.67', email: 'thiagoblue077@gmail.com', telefone: '47997216614', dataNascimento: new Date('2000-03-24') }
  })
  console.log('Daniel updated:', d.count)
  console.log('Thiago updated:', t.count)
}
main().catch(console.error).finally(() => prisma.$disconnect())
