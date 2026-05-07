import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const turma = await prisma.turma.findFirst({
    where: { curso: 'Solda', horario: { contains: 'Quarta 18:00' } }
  })

  if (!turma) {
    console.error('Turma não encontrada')
    return
  }

  const result = await prisma.aluno.updateMany({
    where: { nome: { contains: 'José Manoel' } },
    data: {
      nome: 'Jose Manoel Marques Brito',
      cpf: '151.885.789.21',
      telefone: '47991907346',
      dataNascimento: new Date('2005-06-29'),
      turmaId: turma.id,
    }
  })

  console.log(`✅ ${result.count} aluno atualizado`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
