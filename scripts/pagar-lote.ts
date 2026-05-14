import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const hoje = new Date()
const mes = hoje.getMonth() + 1
const ano = hoje.getFullYear()

async function pagar(nome: string, valor: number, anotacao: string) {
  const alunos = await p.$queryRaw<{ id: string; nome: string }[]>`
    SELECT id, nome FROM "Aluno" WHERE nome ILIKE ${'%' + nome + '%'} AND "deletedAt" IS NULL LIMIT 1
  `
  if (!alunos.length) { console.log(`❌ Não encontrado: ${nome}`); return }
  const aluno = alunos[0]

  await p.$executeRaw`
    UPDATE "Mensalidade" SET pago = true, "dataPagamento" = ${hoje}, valor = ${valor}, "updatedAt" = ${hoje}
    WHERE "alunoId" = ${aluno.id} AND "deletedAt" IS NULL AND pago = false
      AND EXTRACT(MONTH FROM vencimento) = ${mes} AND EXTRACT(YEAR FROM vencimento) = ${ano}
  `
  await p.$executeRaw`
    UPDATE "Aluno" SET "anotacaoFinanceiro" = ${anotacao}, "updatedAt" = ${hoje} WHERE id = ${aluno.id}
  `
  console.log(`✅ ${aluno.nome} — R$ ${valor.toFixed(2).replace('.', ',')} | ${anotacao}`)
}

async function main() {
  await pagar('simon ramon', 250.00, 'Pix Nubank')
  await pagar('alberto batista', 250.00, 'Pix Nubank')
  await pagar('kelvin lopes', 309.00, 'Pix Nubank - pago por Werica')
}

main().catch(console.error).finally(() => process.exit(0))
