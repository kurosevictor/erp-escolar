import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres.gdhcdmrpzyxqllgtordw:postgresql123@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true' })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const inicioMes = new Date('2026-06-01T00:00:00.000Z')
  const fimMes = new Date('2026-06-30T23:59:59.999Z')

  // Alunos ATIVOS com parcelas de junho não pagas (ou sem parcela em junho)
  const alunos = await prisma.aluno.findMany({
    where: {
      situacaoMatricula: 'ATIVO',
      deletedAt: null,
    },
    include: {
      pagamentos: {
        where: {
          vencimento: { gte: inicioMes, lte: fimMes },
        },
      },
      turma: true,
    },
    orderBy: { nome: 'asc' },
  })

  const naoPagaram = alunos.filter(a => {
    const parcelasJunho = a.pagamentos
    if (parcelasJunho.length === 0) return true // sem parcela esse mês
    return parcelasJunho.some(p => !p.pago)
  })

  console.log(`\n=== NÃO PAGARAM EM JUNHO 2026 (${naoPagaram.length} alunos) ===\n`)
  for (const a of naoPagaram) {
    const parcelas = a.pagamentos
    if (parcelas.length === 0) {
      console.log(`- ${a.nome} | sem parcela em junho | turma: ${a.turma?.nome ?? '?'}`)
    } else {
      for (const p of parcelas.filter(p => !p.pago)) {
        const venc = p.vencimento.toLocaleDateString('pt-BR')
        console.log(`- ${a.nome} | R$ ${p.valor} | venc: ${venc} | turma: ${a.turma?.nome ?? '?'}`)
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
