import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const aluno = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Matheus Vinicius', mode: 'insensitive' }, deletedAt: null },
    include: {
      pagamentos: {
        where: { deletedAt: null },
        orderBy: { vencimento: 'desc' },
        take: 5,
      },
    },
  })

  if (!aluno) { console.log('Aluno não encontrado'); return }

  console.log(`\nAluno: ${aluno.nome}`)
  console.log('Últimas parcelas:')
  aluno.pagamentos.forEach(p => {
    console.log(`  #${p.numero} | venc: ${new Date(p.vencimento).toLocaleDateString('pt-BR')} | R$ ${p.valor} | ${p.pago ? '✅ pago' : '❌ aberto'}`)
  })

  // Parcela mais recente não paga = mês atual
  const parcelaAtual = aluno.pagamentos.find(p => !p.pago)
  if (!parcelaAtual) { console.log('\nNenhuma parcela em aberto.'); return }

  console.log(`\nMarcando parcela #${parcelaAtual.numero} (venc: ${new Date(parcelaAtual.vencimento).toLocaleDateString('pt-BR')}) como PAGA com R$ 240,00...`)

  await prisma.parcela.update({
    where: { id: parcelaAtual.id },
    data: { pago: true, valor: 240, dataPagamento: new Date() },
  })

  console.log('✅ Feito! Parcelas anteriores permanecem em aberto em R$ 289,90.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
