import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const turma = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: '10:00' } }
  })

  if (!turma) {
    console.error('Turma não encontrada')
    return
  }

  const result = await prisma.aluno.updateMany({
    where: { nome: { contains: 'Kelvin Lopes' } },
    data: {
      nome: 'Kelvin Lopes dos Santos',
      cpf: '084.385.699-86',
      telefone: '4796345663',
      dataNascimento: new Date('1993-07-25'),
      turmaId: turma.id,
    }
  })

  console.log(`✅ ${result.count} aluno atualizado`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
