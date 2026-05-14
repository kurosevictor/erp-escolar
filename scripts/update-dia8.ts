import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const mes = new Date().getMonth() + 1
const ano = new Date().getFullYear()
const hoje = new Date()

async function marcarPago(nome: string) {
  await p.$executeRaw`
    UPDATE "Mensalidade" m
    SET pago = true, "dataPagamento" = ${hoje}, "updatedAt" = ${hoje}
    FROM "Aluno" a
    WHERE m."alunoId" = a.id
      AND a.nome ILIKE ${'%' + nome + '%'}
      AND m.pago = false
      AND m."deletedAt" IS NULL
      AND EXTRACT(MONTH FROM m.vencimento) = ${mes}
      AND EXTRACT(YEAR FROM m.vencimento) = ${ano}
  `
  console.log(`✅ Marcado como pago: ${nome}`)
}

async function removerAluno(nome: string) {
  const alunos = await p.$queryRaw<{ id: string; nome: string }[]>`
    SELECT id, nome FROM "Aluno" WHERE nome ILIKE ${'%' + nome + '%'} AND "deletedAt" IS NULL LIMIT 1
  `
  if (!alunos.length) { console.log(`❌ Não encontrado: ${nome}`); return }
  const aluno = alunos[0]
  await p.$executeRaw`UPDATE "Aluno" SET "deletedAt" = ${hoje}, "updatedAt" = ${hoje} WHERE id = ${aluno.id}`
  console.log(`🗑️  Removido do sistema: ${aluno.nome}`)
}

async function main() {
  await marcarPago('adrian patrik')
  await marcarPago('gabriel moraes machado')
  await marcarPago('wendell')
  await removerAluno('nickison')
}

main().catch(console.error).finally(() => process.exit(0))
