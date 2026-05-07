import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const carrosSabado = await prisma.turma.findFirst({
    where: { curso: 'Mecânica de Carros', horario: { contains: 'Sábado' } }
  })
  const inglesKids = await prisma.turma.findFirst({
    where: { nome: { contains: 'Inglês Kids' } }
  })
  const soldaQuarta18 = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: '18:00' } }
  })
  const eletricaIndustrial = await prisma.turma.findFirst({
    where: { curso: 'Elétrica Industrial' }
  })

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Alex Senem' } },
    data: {
      nome: 'Alex Senem',
      cpf: '100.969.699-89',
      telefone: '47997102850',
      email: 'alexsenem@hotmail.com',
      dataNascimento: new Date('1997-02-08'),
      turmaId: carrosSabado!.id,
    }
  })
  console.log('✅ Alex Senem')

  // Beatriz Kruger - menor (nasc 2017)
  const beatriz = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Beatriz Krueger' } }
  })
  if (beatriz) {
    await prisma.aluno.update({
      where: { id: beatriz.id },
      data: {
        nome: 'Beatriz Kruger',
        telefone: '47999258090',
        dataNascimento: new Date('2017-03-27'),
        turmaId: inglesKids!.id,
      }
    })
    await prisma.responsavel.upsert({
      where: { alunoId: beatriz.id },
      update: {},
      create: {
        nome: 'Lisandra Giovana Kruger',
        cpf: null,
        telefone: '47999258090',
        alunoId: beatriz.id,
      }
    })
    console.log('✅ Beatriz Kruger + responsável')
  }

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Junior Bueno' } },
    data: {
      nome: 'Junior Bueno Oliveira Lancanova',
      cpf: '073.505.269-70',
      telefone: '48882973720',
      email: 'juniorbuenolancanova@gmail.com',
      dataNascimento: new Date('1991-02-10'),
      turmaId: soldaQuarta18!.id,
    }
  })
  console.log('✅ Junior Bueno Oliveira Lancanova')

  await prisma.aluno.updateMany({
    where: { nome: { contains: 'Juracir' } },
    data: {
      nome: 'Juracir da Silva Mattos',
      cpf: '029.325.599-74',
      telefone: '47884988520',
      email: 'j.acirmattos@gmail.com',
      dataNascimento: new Date('1975-05-04'),
      turmaId: eletricaIndustrial!.id,
    }
  })
  console.log('✅ Juracir da Silva Mattos')

  console.log('\n✅ Lote 6 concluído')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
