import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
async function main() {
  const alunos = await prisma.aluno.findMany({
    orderBy: { nome: 'asc' },
    select: { nome: true, cpf: true, email: true, telefone: true, dataNascimento: true, situacaoMatricula: true }
  })
  console.table(alunos)
  console.log(`\nTotal: ${alunos.length} alunos`)
}
main().catch(console.error).finally(() => prisma.$disconnect())
