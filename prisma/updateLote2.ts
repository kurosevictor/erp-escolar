import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const turmaCarrosTerca = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Carros', horario: { contains: 'Terça' } }
  })
  const turmaMotosSabado = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Motos', horario: { contains: 'Sábado' } }
  })

  // Alberto Batista de Oliveira Filho
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Alberto Batista' } },
    data: {
      nome: 'Alberto Batista de Oliveira Filho',
      cpf: '857.803.885.12',
      telefone: '4799686403',
      dataNascimento: new Date('1994-11-03'),
      turmaId: turmaCarrosTerca!.id,
    }
  })
  console.log('✅ Alberto Batista de Oliveira Filho')

  // Diones Andre de Melo
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Diones' } },
    data: {
      nome: 'Diones Andre de Melo',
      cpf: '083.587.369.24',
      telefone: '4797703705',
      dataNascimento: new Date('1992-03-26'),
      turmaId: turmaCarrosTerca!.id,
    }
  })
  console.log('✅ Diones Andre de Melo')

  // Gabriel Moraes Machado
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Gabriel Moraes' } },
    data: {
      nome: 'Gabriel Moraes Machado',
      cpf: '114.771.699.46',
      telefone: '4797424684',
      dataNascimento: new Date('2000-11-29'),
      turmaId: turmaMotosSabado!.id,
    }
  })
  console.log('✅ Gabriel Moraes Machado')

  // João Vitor dos Santos
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'João Vitor dos Santos' } },
    data: {
      nome: 'Joao Vitor dos Santos',
      cpf: '080.851.339.70',
      telefone: '4799071710',
      dataNascimento: new Date('2007-04-15'),
      turmaId: turmaCarrosTerca!.id,
    }
  })
  console.log('✅ Joao Vitor dos Santos')

  console.log('\n✅ Todos atualizados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
