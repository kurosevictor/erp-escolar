import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const hoje = new Date()
const mes = hoje.getMonth() + 1
const ano = hoje.getFullYear()
const proximoMes = mes === 12 ? 1 : mes + 1
const anoProximo = mes === 12 ? ano + 1 : ano

async function main() {
  // Parcela do mês atual → valor 0, marca como pago (dispensado)
  await p.$executeRaw`
    UPDATE "Mensalidade" m
    SET valor = 0, pago = true, "dataPagamento" = ${hoje}, "updatedAt" = ${hoje}
    FROM "Aluno" a
    WHERE m."alunoId" = a.id
      AND a.nome ILIKE '%jefferson matheus%'
      AND m."deletedAt" IS NULL
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
  `
  console.log('✅ Mês atual: Jefferson — valor zerado e marcado como pago')

  // Parcela do próximo mês → valor 320
  await p.$executeRaw`
    UPDATE "Mensalidade" m
    SET valor = 320, "updatedAt" = ${hoje}
    FROM "Aluno" a
    WHERE m."alunoId" = a.id
      AND a.nome ILIKE '%jefferson matheus%'
      AND m."deletedAt" IS NULL
      AND EXTRACT(MONTH FROM m.vencimento) = ${proximoMes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${anoProximo}
  `
  console.log('✅ Próximo mês: Jefferson — valor atualizado para R$ 320,00')
}

main().catch(console.error).finally(() => process.exit(0))
