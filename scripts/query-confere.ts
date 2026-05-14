import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const nomes = [
  'junior bueno',
  'diones',
  'matheus de brum',
  'joao gabriel wortmeyer',
  'uendson',
  'reiguel',
  'alex senem',
  'fernando senem',
  'celio rodrigues',
  'jorge luis',
]

async function main() {
  const parcelas = await p.$queryRaw<{ id: string; nome: string; vencimento: Date; valor: number; pago: boolean; dataPagamento: Date | null; alunoId: string }[]>`
    SELECT m.id, a.nome, m.vencimento, m.valor, m.pago, m."dataPagamento", m."alunoId"
    FROM "Mensalidade" m
    JOIN "Aluno" a ON a.id = m."alunoId"
    WHERE m."deletedAt" IS NULL
      AND a."deletedAt" IS NULL
      AND EXTRACT(MONTH FROM m.vencimento) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM m.vencimento) = EXTRACT(YEAR FROM CURRENT_DATE)
    ORDER BY a.nome ASC
  `

  console.log('\n=== CONFERÊNCIA DE PAGAMENTOS ===\n')

  for (const busca of nomes) {
    const partes = busca.toLowerCase().split(' ')
    const encontrados = parcelas.filter(p =>
      partes.every(parte => p.nome.toLowerCase().includes(parte))
    )

    if (encontrados.length === 0) {
      // Tenta busca mais ampla (só primeiro nome)
      const primeiro = partes[0]
      const amplos = parcelas.filter(p => p.nome.toLowerCase().includes(primeiro))
      if (amplos.length > 0) {
        console.log(`🔍 "${busca}" — não encontrado exato, similares:`)
        for (const r of amplos) {
          console.log(`   → ${r.nome} | R$ ${r.valor.toFixed(2)} | ${r.pago ? '✅ JÁ PAGO' : '⏳ pendente'} | venc: ${new Date(r.vencimento).toLocaleDateString('pt-BR')}`)
        }
      } else {
        console.log(`❌ "${busca}" — NÃO ENCONTRADO no mês atual`)
      }
    } else {
      for (const r of encontrados) {
        console.log(`${r.pago ? '✅ JÁ PAGO' : '⏳ pendente'} | ${r.nome} | R$ ${r.valor.toFixed(2)} | venc: ${new Date(r.vencimento).toLocaleDateString('pt-BR')}`)
      }
    }
    console.log()
  }
}

main().catch(console.error).finally(() => process.exit(0))
