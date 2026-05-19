import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = agora.getMonth() // maio = 4

  const despesas = [
    { dia: 5,  valor: 136 },
    { dia: 8,  valor: 136 },
    { dia: 12, valor: 140 },
  ]

  for (const d of despesas) {
    const dataPagamento = new Date(ano, mes, d.dia)
    await p.$executeRaw`
      INSERT INTO "Despesa" (id, nome, valor, "diaVencimento", pago, "dataPagamento", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'Impulsionamento',
        ${d.valor},
        ${d.dia},
        true,
        ${dataPagamento},
        ${agora},
        ${agora}
      )
    `
    console.log(`✅ Impulsionamento dia ${d.dia} — R$${d.valor} (pago)`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
