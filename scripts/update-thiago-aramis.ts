import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const mes = agora.getMonth() + 1
  const ano = agora.getFullYear()

  const n = await p.$executeRaw`
    UPDATE "Mensalidade" m SET valor = 250, "updatedAt" = ${agora}
    FROM "Aluno" a
    WHERE m."alunoId" = a.id
      AND a.nome ILIKE '%thiago aramis%'
      AND m."deletedAt" IS NULL
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
  `
  console.log(`✅ Thiago Aramis Balsanelli: valor atualizado para R$ 250,00 (${n} parcela)`)
}

main().catch(console.error).finally(() => process.exit(0))
