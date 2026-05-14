import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const aluno = await prisma.aluno.findFirst({
    where: { nome: { contains: 'Matheus Vinicius', mode: 'insensitive' }, deletedAt: null },
    include: { pagamentos: { where: { deletedAt: null }, orderBy: { vencimento: 'asc' } } },
  })

  if (!aluno) { console.log('Aluno não encontrado'); return }

  // Verificar se março já existe
  const marcoExiste = aluno.pagamentos.some(p => new Date(p.vencimento).getMonth() === 2)
  if (marcoExiste) { console.log('Parcela de março já existe.'); return }

  // Usar o mesmo dia de vencimento das outras parcelas (dia 8)
  const diaVenc = aluno.diaVencimento ?? new Date(aluno.pagamentos[0]?.vencimento).getDate() ?? 8

  // Próximo número de parcela
  const proximoNumero = Math.max(...aluno.pagamentos.map(p => p.numero), 0) + 1

  const nova = await prisma.parcela.create({
    data: {
      alunoId: aluno.id,
      numero: proximoNumero,
      valor: 289.90,
      vencimento: new Date(2026, 2, diaVenc), // março = mês índice 2
      pago: false,
    },
  })

  console.log(`✅ Parcela de março criada:`)
  console.log(`   venc ${new Date(nova.vencimento).toLocaleDateString('pt-BR')} | R$ ${nova.valor.toFixed(2)} | ❌ ABERTO`)

  // Estado final
  const final = await prisma.aluno.findFirst({
    where: { id: aluno.id },
    include: { pagamentos: { where: { deletedAt: null }, orderBy: { vencimento: 'asc' } } },
  })
  console.log('\nTodas as parcelas do Matheus:')
  final?.pagamentos.forEach(p => {
    console.log(`  venc ${new Date(p.vencimento).toLocaleDateString('pt-BR')} | R$ ${p.valor.toFixed(2)} | ${p.pago ? '✅ PAGO' : '❌ ABERTO'}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
