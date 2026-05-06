import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const REMOVER = ['Victor Pietro', 'Samara Baltazar', 'João da Silva', 'João Vitor Ramos']

async function main() {
  for (const nome of REMOVER) {
    const aluno = await prisma.aluno.findFirst({ where: { nome } })
    if (!aluno) { console.log(`⚠️  Não encontrado: ${nome}`); continue }

    await prisma.parcela.deleteMany({ where: { alunoId: aluno.id } })
    await prisma.presenca.deleteMany({ where: { alunoId: aluno.id } })
    await prisma.aluno.delete({ where: { id: aluno.id } })
    console.log(`🗑️  Removido: ${nome}`)
  }

  // Allan Henrique - placeholder
  await prisma.aluno.updateMany({
    where: { nome: 'Allan Henrique' },
    data: { diaVencimento: 8, valorMensalidade: 0 },
  })
  console.log('✅ Allan Henrique atualizado com placeholder (dia 8, valor pendente)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
