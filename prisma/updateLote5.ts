import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const informaticaSabado10 = await prisma.turma.findFirst({
    where: { curso: 'Informática', horario: { contains: '10:00' } }
  })
  const motoSegunda = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Motos', horario: { contains: 'Segunda' } }
  })
  const eletricaIndustrial = await prisma.turma.findFirst({
    where: { curso: 'Elétrica Industrial' }
  })
  const soldaSabado10 = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: '10:00' } }
  })

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Nilza' } },
    data: {
      nome: 'Nilza da Silva Pinheiro',
      email: 'pnilza418@gmail.com',
      telefone: '47997064535',
      dataNascimento: new Date('1980-02-16'),
      turmaId: informaticaSabado10!.id,
    }
  })
  console.log('✅ Nilza da Silva Pinheiro')

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Paulo Cesar' } },
    data: {
      nome: 'Paulo Cesar de Araujo',
      cpf: '065.918.029-40',
      telefone: '47992139192',
      email: 'instrutorpauloaraujo@gmail.com',
      dataNascimento: new Date('1989-02-28'),
      turmaId: motoSegunda!.id,
    }
  })
  console.log('✅ Paulo Cesar de Araujo')

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Simon Ramon' } },
    data: {
      nome: 'Simon Ramon Jimenez',
      telefone: '48990774440',
      email: 'jimenezsimonramon@gmail.com',
      dataNascimento: new Date('1978-02-01'),
      turmaId: eletricaIndustrial!.id,
    }
  })
  console.log('✅ Simon Ramon Jimenez')

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Tulho' } },
    data: {
      nome: 'Tulho Costa Santos',
      cpf: '093.200.065-71',
      telefone: '79994737640',
      email: 'tulhocosta9896@gmail.com',
      dataNascimento: new Date('1999-04-25'),
      turmaId: soldaSabado10!.id,
    }
  })
  console.log('✅ Tulho Costa Santos')

  console.log('\n✅ Lote 5 concluído')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
