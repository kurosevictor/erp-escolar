import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const hoje = new Date()
  const parcelaId = 'cmou696so0003acbmcdq6ruab'
  const alunoId = 'cmosuqbwt000dqsbmkx2w07qy'

  await p.$executeRaw`
    UPDATE "Mensalidade"
    SET pago = true, "dataPagamento" = ${hoje}, valor = ${209.90}, "updatedAt" = ${hoje}
    WHERE id = ${parcelaId}
  `
  await p.$executeRaw`
    UPDATE "Aluno"
    SET "anotacaoFinanceiro" = ${'Pix Nubank - pago por Rodrigo Tolentino'}, "updatedAt" = ${hoje}
    WHERE id = ${alunoId}
  `
  console.log('✅ Pago: João Gabriel Wortmeyer — R$ 209,90 | Pix Nubank - pago por Rodrigo Tolentino')
}

main().catch(console.error).finally(() => process.exit(0))
