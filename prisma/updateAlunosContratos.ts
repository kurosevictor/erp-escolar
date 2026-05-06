import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const alunosUpdate = [
    {
      nome: 'Daniel Ferreira da Venda Filho',
      cpf: '494.789.598.59',
      email: 'camilaedaniel02@hotmail.com',
      telefone: '47996383263',
      dataNascimento: new Date('2000-02-23'),
    },
    {
      nome: 'Isabela Honorato Roso',
      cpf: '',
      email: 'isabellaroso2020@gmail.com',
      telefone: '47984737085',
      dataNascimento: new Date('2011-06-06'),
    },
    {
      nome: 'Nicolas Gabriel Doge',
      cpf: '125.136.379.25',
      email: 'jair93571@gmail.com',
      telefone: '4797314995',
      dataNascimento: new Date('2016-02-26'),
    },
    {
      nome: 'Thiago Aramis Balsanelli',
      cpf: '130.053.739.67',
      email: 'thiagoblue077@gmail.com',
      telefone: '47997216614',
      dataNascimento: new Date('2000-03-24'),
    },
  ]

  for (const aluno of alunosUpdate) {
    await prisma.aluno.updateMany({
      where: { nome: aluno.nome },
      data: {
        cpf: aluno.cpf || undefined,
        email: aluno.email,
        telefone: aluno.telefone,
        dataNascimento: aluno.dataNascimento,
      },
    })
  }

  console.log(`✅ 4 alunos atualizados com dados dos contratos`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
