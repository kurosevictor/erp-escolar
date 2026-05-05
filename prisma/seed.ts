import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const turma = await prisma.turma.create({
    data: {
      nome: 'Turma A - Manhã',
      curso: 'Técnico em Informática',
      turno: 'Manhã',
      horario: '08:00 - 12:00',
    },
  })

  const aluno = await prisma.aluno.create({
    data: {
      nome: 'João da Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
      telefone: '47999999999',
      dataMatricula: new Date(),
      turmaId: turma.id,
      pagamentos: {
        create: [
          { numero: 1, valor: 299, vencimento: new Date('2026-06-01'), pago: true, dataPagamento: new Date('2026-05-28') },
          { numero: 2, valor: 299, vencimento: new Date('2026-07-01') },
          { numero: 3, valor: 299, vencimento: new Date('2026-08-01') },
        ],
      },
    },
  })

  console.log('Seed concluído:', { turma, aluno })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
