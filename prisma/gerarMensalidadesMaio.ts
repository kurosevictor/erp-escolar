import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const JA_PAGARAM = ['Isabela Honorato Roso', 'Shadi Yared']

async function main() {
  const alunos = await prisma.aluno.findMany({
    select: { id: true, nome: true, diaVencimento: true, valorMensalidade: true },
    where: { situacaoMatricula: 'ATIVO' },
  })

  let criadas = 0
  let semDados: string[] = []

  for (const aluno of alunos) {
    if (!aluno.diaVencimento || !aluno.valorMensalidade) {
      semDados.push(aluno.nome)
      continue
    }

    const pago = JA_PAGARAM.includes(aluno.nome)
    const vencimento = new Date(2026, 4, aluno.diaVencimento) // maio = mês 4

    await prisma.parcela.create({
      data: {
        numero: 1,
        valor: aluno.valorMensalidade,
        vencimento,
        pago,
        dataPagamento: pago ? new Date() : null,
        alunoId: aluno.id,
      },
    })
    criadas++
  }

  console.log(`✅ ${criadas} parcelas de maio criadas`)
  if (semDados.length > 0)
    console.log('⚠️  Sem diaVencimento ou valor:', semDados)
}

main().catch(console.error).finally(() => prisma.$disconnect())
