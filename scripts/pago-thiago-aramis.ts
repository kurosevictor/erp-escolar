import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const mes = 5; const ano = 2026

  const alunos = await p.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Aluno" WHERE nome ILIKE '%thiago aramis%' AND "deletedAt" IS NULL LIMIT 1
  `
  if (!alunos.length) { console.log('❌ Não encontrado'); return }
  const alunoId = alunos[0].id

  const n1 = await p.$executeRaw`
    UPDATE "Mensalidade" SET pago = true, "dataPagamento" = ${agora}, "updatedAt" = ${agora}
    WHERE "alunoId" = ${alunoId}
      AND EXTRACT(MONTH FROM vencimento) = ${mes}
      AND EXTRACT(YEAR FROM vencimento) = ${ano}
      AND "deletedAt" IS NULL
  `
  console.log(`Parcelas atualizadas: ${n1}`)

  const n2 = await p.$executeRaw`
    UPDATE "Aluno" SET "anotacaoFinanceiro" = 'Pix Nubank no nome de Bomm', "updatedAt" = ${agora}
    WHERE id = ${alunoId}
  `
  console.log(`Aluno atualizado: ${n2}`)
  console.log('✅ Thiago Aramis Balsanelli → pago | Pix Nubank no nome de Bomm')
}

main().catch(console.error).finally(() => process.exit(0))
