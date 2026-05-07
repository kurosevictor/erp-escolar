import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const soldaSabado10 = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: '10:00' } }
  })
  const motoSegunda = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Motos', horario: { contains: 'Segunda' } }
  })
  const motoSabado = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Motos', horario: { contains: 'Sábado' } }
  })
  const admSabado = await prisma.turma.findFirst({
    where: { curso: 'Administração / Secretariado' }
  })
  const informaticaSabado10 = await prisma.turma.findFirst({
    where: { curso: 'Informática', horario: { contains: '10:00' } }
  })
  const carrosSabado = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Carros', horario: { contains: 'Sábado' } }
  })
  const eletricaResidencial = await prisma.turma.findFirst({
    where: { curso: 'Elétrica Residencial' }
  })

  // Rodrileico José
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Rodrileico' } },
    data: {
      cpf: '100.735.519-02',
      telefone: '47921224900',
      email: 'rodryjoseuniate@gmail.com',
      dataNascimento: new Date('1997-08-04'),
      turmaId: soldaSabado10!.id,
    }
  })
  console.log('✅ Rodrileico José')

  // Marcio Roberto Klinkoski — menor
  const marcio = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Marcio Roberto' } }
  })
  if (marcio) {
    await prisma.aluno.update({
      where: { id: marcio.id },
      data: {
        cpf: '150.241.539-95',
        telefone: '47997786356',
        email: 'marcioklinkoski12@gmail.com',
        dataNascimento: new Date('2008-04-07'),
        turmaId: motoSegunda!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: marcio.id },
      update: {},
      create: {
        nome: 'Marcio Roberto Klinkoski',
        cpf: null,
        telefone: '47997786356',
        alunoId: marcio.id,
      }
    })
  }
  console.log('✅ Marcio Roberto Klinkoski')

  // Matheus de Brum — menor
  const matheus = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Matheus de Brum' } }
  })
  if (matheus) {
    await prisma.aluno.update({
      where: { id: matheus.id },
      data: {
        cpf: '134.452.989-55',
        telefone: '47568169080',
        email: 'marcosffroud@gmail.com',
        dataNascimento: new Date('2009-12-21'),
        turmaId: motoSabado!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: matheus.id },
      update: {},
      create: {
        nome: 'Matheus de Brum',
        cpf: null,
        telefone: '47568169080',
        alunoId: matheus.id,
      }
    })
  }
  console.log('✅ Matheus de Brum')

  // Mikaelly de Cassia — menor
  const mikaelly = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Mikaelly' } }
  })
  if (mikaelly) {
    await prisma.aluno.update({
      where: { id: mikaelly.id },
      data: {
        cpf: '142.972.079-40',
        telefone: '47991345742',
        email: 'mikaelly_placeholder@futura.com',
        dataNascimento: new Date('2006-09-28'),
        turmaId: admSabado!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: mikaelly.id },
      update: {},
      create: {
        nome: 'Mikaelly de Cassia',
        cpf: null,
        telefone: '47991345742',
        alunoId: mikaelly.id,
      }
    })
  }
  console.log('✅ Mikaelly de Cassia')

  // Laura Emanuele — menor
  const laura = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Laura Emanuele' } }
  })
  if (laura) {
    await prisma.aluno.update({
      where: { id: laura.id },
      data: {
        cpf: '002.210.709-66',
        telefone: '49981931350',
        email: 'mayarasantana6113@gmail.com',
        dataNascimento: new Date('2008-11-14'),
        turmaId: informaticaSabado10!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: laura.id },
      update: {},
      create: {
        nome: 'Laura Emanuele',
        cpf: null,
        telefone: '49981931350',
        alunoId: laura.id,
      }
    })
  }
  console.log('✅ Laura Emanuele')

  // Lucas Reiniak — maior
  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Lucas Reiniak' } },
    data: {
      cpf: '127.314.969-67',
      telefone: '47999332190',
      email: 'lucasreiniak@outlook.com',
      dataNascimento: new Date('2001-11-26'),
      turmaId: carrosSabado!.id,
    }
  })
  console.log('✅ Lucas Reiniak')

  // Kauê Felipe — menor
  const kaue = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Kauê Felipe' } }
  })
  if (kaue) {
    await prisma.aluno.update({
      where: { id: kaue.id },
      data: {
        cpf: '111.640.769-81',
        telefone: '41964907630',
        email: 'kauepotrique@gmail.com',
        dataNascimento: new Date('2006-11-22'),
        turmaId: eletricaResidencial!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: kaue.id },
      update: {},
      create: {
        nome: 'Kauê Felipe',
        cpf: null,
        telefone: '41964907630',
        alunoId: kaue.id,
      }
    })
  }
  console.log('✅ Kauê Felipe')

  console.log('\n✅ Lote 7 concluído')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
