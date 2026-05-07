import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const soldaQuarta20 = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: '20:00' } }
  })
  const soldaSabado08 = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: '08:00' } }
  })
  const soldaSabado10 = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: '10:00' } }
  })
  const eletricaResidencial = await prisma.turma.findFirst({
    where: { curso: 'Elétrica Residencial' }
  })

  // Luiz Phelipe - menor (nasc 2006)
  const luiz = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Luiz Phelipe' } }
  })
  if (luiz) {
    await prisma.aluno.update({
      where: { id: luiz.id },
      data: {
        nome: 'Luiz Phelipe Andrade de Araujo',
        cpf: '077.029.515-08',
        telefone: '47996738505',
        email: 'btg2532@gmail.com',
        dataNascimento: new Date('2006-07-03'),
        turmaId: soldaQuarta20!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: luiz.id },
      update: {},
      create: {
        nome: 'Luiz Phelipe Andrade de Araujo',
        cpf: '077.029.515-08',
        telefone: '47996738505',
        alunoId: luiz.id,
      }
    })
    console.log('✅ Luiz Phelipe Andrade de Araujo')
  }

  // Ricardo Alves Bispo - menor (nasc 2008)
  const ricardo = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Ricardo Alves' } }
  })
  if (ricardo) {
    await prisma.aluno.update({
      where: { id: ricardo.id },
      data: {
        nome: 'Ricardo Alves Bispo da Silva',
        cpf: '592.046.938-27',
        telefone: '47991601182',
        dataNascimento: new Date('2008-08-15'),
        turmaId: soldaSabado08!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: ricardo.id },
      update: {},
      create: {
        nome: 'Amanda Alves Santiago',
        cpf: null,
        telefone: '47991601182',
        alunoId: ricardo.id,
      }
    })
    console.log('✅ Ricardo Alves Bispo da Silva')
  }

  // Antony Williamis - maior
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Antony' } },
    data: {
      nome: 'Antony Williamis da Silva',
      cpf: '082.926.834-02',
      telefone: '47999371812',
      email: 'antony.aws.10@gmail.com',
      dataNascimento: new Date('1990-08-31'),
      turmaId: eletricaResidencial!.id,
    }
  })
  console.log('✅ Antony Williamis da Silva')

  // Daniel Vieira - maior
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Daniel Vieira' } },
    data: {
      nome: 'Daniel Vieira Menezes',
      cpf: '102.347.505-70',
      telefone: '79967605910',
      email: 'vieiramenezesdaniel@gmail.com',
      dataNascimento: new Date('2002-08-13'),
      turmaId: soldaSabado10!.id,
    }
  })
  console.log('✅ Daniel Vieira Menezes')

  console.log('\n✅ Lote 3 concluído')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
