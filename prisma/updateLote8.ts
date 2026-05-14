import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const carrosTerca = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Carros', horario: { contains: 'Terça' } }
  })
  const carrosSabado = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Carros', horario: { contains: 'Sábado' } }
  })
  const motoSabado = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Motos', horario: { contains: 'Sábado' } }
  })
  const motoSegunda = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Motos', horario: { contains: 'Segunda' } }
  })
  const ingles3 = await prisma.turma.findFirst({
    where: { nome: { contains: 'Inglês 3' } }
  })

  // Giliarde José Lopes
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Giliarde' } },
    data: {
      cpf: '045.132.929-54',
      telefone: '47975021870',
      email: 'tecnico.segurança@depecil.com.br',
      dataNascimento: new Date('1985-05-17'),
      turmaId: carrosTerca!.id,
    }
  })
  console.log('✅ Giliarde José Lopes')

  // Celio Rodrigues Bento
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Celio' } },
    data: {
      cpf: '259.461.938-80',
      telefone: '47992816149',
      email: 'bentorodriguescelio@gmail.com',
      dataNascimento: new Date('1972-11-03'),
      turmaId: carrosSabado!.id,
    }
  })
  console.log('✅ Celio Rodrigues Bento')

  // Danilo Cruz dos Santos
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Danilo' } },
    data: {
      cpf: '054.806.835-60',
      telefone: '13996719991',
      email: 'danilocrus91@gmail.com',
      dataNascimento: new Date('1991-11-07'),
      turmaId: motoSabado!.id,
    }
  })
  console.log('✅ Danilo Cruz dos Santos')

  // Jacques Amaral
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Jacques' } },
    data: {
      cpf: '024.394.020-36',
      telefone: '47792036922',
      email: 'jacquesbrumf@gmail.com',
      dataNascimento: new Date('1991-01-28'),
      turmaId: motoSegunda!.id,
    }
  })
  console.log('✅ Jacques Amaral')

  // Kassiano Campos Bonfim — menor (nasc 2006)
  const kassiano = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Kassiano' } }
  })
  if (kassiano) {
    await prisma.aluno.update({
      where: { id: kassiano.id },
      data: {
        cpf: '021.108.242-20',
        telefone: '47971118740',
        email: 'kassianomuniz17@gmail.com',
        dataNascimento: new Date('2006-06-17'),
        turmaId: motoSabado!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: kassiano.id },
      update: {},
      create: {
        nome: 'Kassiano Campos Bonfim',
        cpf: null,
        telefone: '47971118740',
        alunoId: kassiano.id,
      }
    })
  }
  console.log('✅ Kassiano Campos Bonfim')

  // Daniel Reliquias — menor (nasc 2006)
  const daniel = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Daniel Reliquias' } }
  })
  if (daniel) {
    await prisma.aluno.update({
      where: { id: daniel.id },
      data: {
        cpf: '118.149.759-25',
        telefone: '47925317550',
        email: 'danielreliquias_placeholder@futura.com',
        dataNascimento: new Date('2006-03-07'),
        turmaId: ingles3!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: daniel.id },
      update: {},
      create: {
        nome: 'Daniel Reliquias',
        cpf: null,
        telefone: '47925317550',
        alunoId: daniel.id,
      }
    })
  }
  console.log('✅ Daniel Reliquias')

  // Gabriel Gouvea
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Gabriel Gouvea' } },
    data: {
      cpf: '106.904.609-45',
      telefone: '47991212388',
      email: 'edi2148az@gmail.com',
      dataNascimento: new Date('2001-10-26'),
      turmaId: motoSegunda!.id,
    }
  })
  console.log('✅ Gabriel Gouvea')

  console.log('\n✅ Lote 8 concluído')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
