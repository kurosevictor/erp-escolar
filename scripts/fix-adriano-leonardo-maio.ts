import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()
  const mes = agora.getMonth() + 1  // 5 = maio
  const ano = agora.getFullYear()   // 2026

  for (const nome of ['Adriano Devegili', 'Leonardo Pietro Nunes Pedrozo']) {
    // Busca aluno
    const alunos = await p.$queryRaw<{ id: string; valorMensalidade: number; diaVencimento: number }[]>`
      SELECT id, "valorMensalidade", "diaVencimento" FROM "Aluno"
      WHERE nome = ${nome} AND "deletedAt" IS NULL LIMIT 1
    `
    if (!alunos.length) { console.log(`❌ ${nome} não encontrado`); continue }
    const aluno = alunos[0]

    // Atualiza parcela de maio: valor 0, pago = true
    await p.$executeRaw`
      UPDATE "Mensalidade" SET valor = 0, pago = true, "dataPagamento" = ${agora}, "updatedAt" = ${agora}
      WHERE "alunoId" = ${aluno.id}
        AND EXTRACT(MONTH FROM vencimento) = ${mes}
        AND EXTRACT(YEAR FROM vencimento) = ${ano}
        AND "deletedAt" IS NULL
    `
    console.log(`✅ ${nome} — maio: pago (R$0)`)

    // Cria parcela de junho com valor atual
    const vencJunho = new Date(ano, 5, aluno.diaVencimento) // mês 5 = junho
    await p.$executeRaw`
      INSERT INTO "Mensalidade" (id, "alunoId", numero, valor, vencimento, pago, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${aluno.id}, 2, ${aluno.valorMensalidade}, ${vencJunho}, false, ${agora}, ${agora})
    `
    console.log(`✅ ${nome} — junho: R$${aluno.valorMensalidade.toFixed(2).replace('.', ',')} — venc. ${vencJunho.toLocaleDateString('pt-BR')}`)
  }
}

main().catch(console.error).finally(() => process.exit(0))
