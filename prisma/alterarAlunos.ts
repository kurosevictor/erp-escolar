import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const turmas = await prisma.turma.findMany()

  // 1. REMOVER
  await prisma.aluno.deleteMany({
    where: { nome: { in: ['Igor Iori', 'Angela', 'Everton e Kaue', 'Everton e Kaue só everton'] } }
  })
  console.log('✅ Alunos removidos')

  // 2. ATUALIZAR nomes
  await prisma.aluno.updateMany({
    where: { nome: 'Alberto Batista' },
    data: { nome: 'Alberto Batista Filho' }
  })
  await prisma.aluno.updateMany({
    where: { nome: 'João Maria' },
    data: { nome: 'João Maria Leffel' }
  })
  console.log('✅ Nomes atualizados')

  // 3. ADICIONAR novos
  const novosDados = [
    'Thiago Aramis Balsanelli',
    'Nicolas Gabriel Doge',
    'João Vitor dos Santos',
    'Daniel Ferreira da Venda Filho',
    'Isabela Honorato Roso',
    'Allan Henrique',
    'Everton Bruno',
    'Kauê Felipe'
  ]

  for (const nome of novosDados) {
    const turmaAleatoria = turmas[Math.floor(Math.random() * turmas.length)]
    await prisma.aluno.create({
      data: {
        nome,
        cpf: `CPF_${nome.replace(/\s/g, '_')}`,
        dataMatricula: new Date(),
        situacaoMatricula: 'ATIVO',
        turmaId: turmaAleatoria.id,
      }
    })
  }
  console.log(`✅ ${novosDados.length} novos alunos adicionados`)

  const total = await prisma.aluno.count()
  console.log(`\n📊 Total de alunos no sistema: ${total}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
