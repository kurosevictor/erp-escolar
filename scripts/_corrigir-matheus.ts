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
  console.log('Aluno:', aluno.nome)
  console.log('\nEstado atual:')
  aluno.pagamentos.forEach(p => {
    console.log(`  venc ${new Date(p.vencimento).toLocaleDateString('pt-BR')} | R$ ${p.valor.toFixed(2)} | ${p.pago ? '✅ PAGO' : '❌ ABERTO'}`)
  })

  // 1. Maio (05/2026) → pago com R$ 240
  const maio = aluno.pagamentos.find(p => new Date(p.vencimento).getMonth() === 4) // mês 4 = maio (0-indexed)
  if (maio) {
    await prisma.parcela.update({
      where: { id: maio.id },
      data: { pago: true, valor: 240, dataPagamento: new Date() },
    })
    console.log('\n✅ Maio atualizado → PAGO R$ 240,00')
  } else {
    console.log('\n⚠️  Parcela de maio não encontrada')
  }

  // 2. Abril (04/2026) → aberto R$ 289,90
  const abril = aluno.pagamentos.find(p => new Date(p.vencimento).getMonth() === 3) // mês 3 = abril
  if (abril) {
    await prisma.parcela.update({
      where: { id: abril.id },
      data: { pago: false, valor: 289.90, dataPagamento: null },
    })
    console.log('✅ Abril atualizado → ABERTO R$ 289,90')
  } else {
    console.log('⚠️  Parcela de abril não encontrada')
  }

  // 3. Março (03/2026) → verificar/aberto R$ 289,90
  const marco = aluno.pagamentos.find(p => new Date(p.vencimento).getMonth() === 2) // mês 2 = março
  if (marco) {
    await prisma.parcela.update({
      where: { id: marco.id },
      data: { pago: false, valor: 289.90, dataPagamento: null },
    })
    console.log('✅ Março atualizado → ABERTO R$ 289,90')
  } else {
    console.log('⚠️  Parcela de março não encontrada no sistema')
  }

  // 4. Atualizar valorMensalidade do aluno → R$ 240 (próximas parcelas)
  await prisma.aluno.update({
    where: { id: aluno.id },
    data: { valorMensalidade: 240 },
  })
  console.log('✅ valorMensalidade atualizado → R$ 240,00 (próximas parcelas)')

  // Estado final
  const final = await prisma.aluno.findFirst({
    where: { id: aluno.id },
    include: { pagamentos: { where: { deletedAt: null }, orderBy: { vencimento: 'asc' } } },
  })
  console.log('\nEstado final:')
  final?.pagamentos.forEach(p => {
    const dt = p.dataPagamento ? ` | pago em ${new Date(p.dataPagamento).toLocaleDateString('pt-BR')}` : ''
    console.log(`  venc ${new Date(p.vencimento).toLocaleDateString('pt-BR')} | R$ ${p.valor.toFixed(2)} | ${p.pago ? '✅ PAGO' : '❌ ABERTO'}${dt}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
