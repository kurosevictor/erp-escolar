import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const TURMA_ID = 'cmoss4ek30005nsbmxhj5nnih' // Elétrica Residencial - Quinta 18:30-20:30

async function main() {
  const aluno = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento",
      "turmaId",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Jose Anderson Marques da Silva',
      '06464062999',
      '4791921300',
      'andersonmarquesds@hotmail.com',
      '1987-12-21',
      ${TURMA_ID},
      249,
      8,
      'ATIVO',
      NOW(), NOW(), NOW()
    ) RETURNING id
  `
  const alunoId = aluno[0].id
  console.log(`Aluno criado: ${alunoId}`)

  // Maio: R$0 pago (entrada/matrícula simbólica)
  await p.parcela.create({
    data: { numero: 1, valor: 0, vencimento: new Date('2025-05-08'), pago: true, dataPagamento: new Date(), alunoId }
  })
  console.log('Parcela maio: R$0 - PAGO')

  // Junho: R$249 pendente
  await p.parcela.create({
    data: { numero: 2, valor: 249, vencimento: new Date('2025-06-08'), pago: false, alunoId }
  })
  console.log('Parcela junho: R$249 - PENDENTE')
}

main().catch(console.error).finally(() => p.$disconnect())
