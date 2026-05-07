import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const turmaIngles = await prisma.turma.findFirst({
    where: { curso: 'Inglês', horario: { contains: '10:00' } }
  })

  const milena = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Milena Bender' } }
  })

  if (!milena) {
    console.error('Milena não encontrada')
    return
  }

  await prisma.aluno.update({
    where: { id: milena.id },
    data: {
      nome: 'Milena Bender Andrighetto',
      cpf: '106.705.929-60',
      telefone: '47999673632',
      dataNascimento: new Date('2011-04-25'),
      turmaId: turmaIngles!.id,
    }
  })

  await prisma.responsavel.upsert({
    where: { alunoId: milena.id },
    update: {},
    create: {
      nome: 'Cristiane Bender',
      cpf: '003.449.049-38',
      telefone: '47999673632',
      alunoId: milena.id,
    }
  })

  console.log('✅ Milena Bender Andrighetto + responsável atualizados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
