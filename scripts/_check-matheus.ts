import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const aluno = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Matheus Vinicius', mode: 'insensitive' }, deletedAt: null },
    include: { pagamentos: { where: { deletedAt: null }, orderBy: { vencimento: 'asc' } } },
  })
  console.log('Aluno:', aluno?.nome)
  aluno?.pagamentos.forEach(p => {
    const s = p.pago ? '✅ PAGO' : '❌ ABERTO'
    const dt = p.dataPagamento ? ` | pago em ${new Date(p.dataPagamento).toLocaleDateString('pt-BR')}` : ''
    console.log(`  #${p.numero} | venc ${new Date(p.vencimento).toLocaleDateString('pt-BR')} | R$ ${p.valor.toFixed(2)} | ${s}${dt}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
