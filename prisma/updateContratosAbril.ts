import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {

  // Allan Henrique Correa - novo
  const turmaMotos = await prisma.turma.findFirst({ where: { curso: 'Mecânica de Motos' } })
  await prisma.aluno.updateMany({
    where: { nome: 'Allan Henrique' },
    data: {
      nome: 'Allan Henrique Correa',
      cpf: '074.325.879.73',
      telefone: '41983587024',
      dataNascimento: new Date('1990-01-18'),
      turmaId: turmaMotos!.id,
    }
  })
  console.log('✅ Allan Henrique Correa atualizado')

  // Daniel Ferreira da Venda Filho - atualizar telefone
  await prisma.aluno.updateMany({
    where: { nome: 'Daniel Ferreira da Venda' },
    data: {
      nome: 'Daniel Ferreira da Venda Filho',
      cpf: '494.789.598.59',
      telefone: '47996383263',
      dataNascimento: new Date('2000-02-23'),
    }
  })
  console.log('✅ Daniel Ferreira da Venda Filho atualizado')

  // Thiago Aramis Balsanelli - atualizar
  const turmaCarros = await prisma.turma.findFirst({ where: { curso: 'Mecânica de Carros' } })
  await prisma.aluno.updateMany({
    where: { nome: 'Thiago Aramis' },
    data: {
      nome: 'Thiago Aramis Balsanelli',
      cpf: '130.053.739.67',
      telefone: '47997216614',
      dataNascimento: new Date('2000-03-24'),
      turmaId: turmaCarros!.id,
    }
  })
  console.log('✅ Thiago Aramis Balsanelli atualizado')

  // Isabella Honorato Roso - menor, sem CPF
  const turmaAdm = await prisma.turma.findFirst({ where: { curso: 'Administração / Secretariado' } })
  const isabella = await prisma.aluno.findFirst({ where: { nome: { contains: 'Isabela Honorato' } } })
  if (isabella) {
    await prisma.aluno.update({
      where: { id: isabella.id },
      data: {
        telefone: '47984737085',
        dataNascimento: new Date('2011-06-06'),
        turmaId: turmaAdm!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: isabella.id },
      update: {},
      create: {
        nome: 'Michelli de Paula Honorato',
        cpf: null,
        telefone: '47997262293',
        alunoId: isabella.id,
      }
    })
    console.log('✅ Isabella Honorato Roso + responsável atualizados')
  }

  // Nicolas Gabriel Doge - menor
  const turmaIngles = await prisma.turma.findFirst({ where: { nome: { contains: 'Inglês Kids' } } })
  const nicolas = await prisma.aluno.findFirst({ where: { nome: { contains: 'Nicolas Gabriel' } } })
  if (nicolas) {
    await prisma.aluno.update({
      where: { id: nicolas.id },
      data: {
        cpf: '125.136.379.25',
        telefone: '4797314995',
        dataNascimento: new Date('2016-02-26'),
        turmaId: turmaIngles!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: nicolas.id },
      update: {},
      create: {
        nome: 'Jair Andrei Doge',
        cpf: '069.576.069.61',
        telefone: '4797314995',
        alunoId: nicolas.id,
      }
    })
    console.log('✅ Nicolas Gabriel Doge + responsável atualizados')
  }

  console.log('\n✅ Todos os contratos processados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
