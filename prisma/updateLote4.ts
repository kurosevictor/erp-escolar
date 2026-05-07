import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const eletricaIndustrial = await prisma.turma.findFirst({
    where: { curso: 'Elétrica Industrial' }
  })
  const eletricaResidencial = await prisma.turma.findFirst({
    where: { curso: 'Elétrica Residencial' }
  })
  const motoSegunda = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Motos', horario: { contains: 'Segunda' } }
  })

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Edgar Vicente' } },
    data: {
      nome: 'Edgar Vicente',
      cpf: '569.928.669-15',
      telefone: '47918322670',
      email: 'vicenteedgar109@gmail.com',
      dataNascimento: new Date('1967-09-06'),
      turmaId: eletricaIndustrial!.id,
    }
  })
  console.log('✅ Edgar Vicente')

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Jonathan Henrique' } },
    data: {
      nome: 'Jonathan Henrique Oliveira Domingues',
      cpf: '471.930.528-88',
      telefone: '13996064730',
      email: 'jonathan123santos30@gmail.com',
      dataNascimento: new Date('1997-02-05'),
      turmaId: eletricaResidencial!.id,
    }
  })
  console.log('✅ Jonathan Henrique Oliveira Domingues')

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Maylon' } },
    data: {
      nome: 'Maylon Velasque Gaspar',
      cpf: '090.090.449-63',
      telefone: '47887015320',
      email: 'maylonvg51@gmail.com',
      dataNascimento: new Date('2000-01-20'),
      turmaId: motoSegunda!.id,
    }
  })
  console.log('✅ Maylon Velasque Gaspar')

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Nikolas Matheus' } },
    data: {
      nome: 'Nikolas Matheus da Mota',
      cpf: '101.412.709-80',
      telefone: '47924445380',
      email: 'motta4429@gmail.com',
      dataNascimento: new Date('1996-09-21'),
      turmaId: motoSegunda!.id,
    }
  })
  console.log('✅ Nikolas Matheus da Mota')

  console.log('\n✅ Lote 4 concluído')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
