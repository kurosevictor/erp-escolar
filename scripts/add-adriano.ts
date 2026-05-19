import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const turmas = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma"
    WHERE curso ILIKE '%solda%' AND horario = 'Quarta 20:00–22:00' LIMIT 1
  `
  if (!turmas.length) { console.log('❌ Turma não encontrada'); return }
  const turma = turmas[0]
  console.log(`Turma: ${turma.curso} — ${turma.horario}`)

  const agora = new Date()
  const dataNascimento = new Date('1991-04-30')
  const vencimento = new Date(agora.getFullYear(), agora.getMonth(), 10)

  const aluno = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento",
      "turmaId", "turmaId2",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Adriano Devegili',
      '07993506999',
      '4796610152',
      'SEM_EMAIL_ADRIANO_DEVEGILI',
      ${dataNascimento},
      ${turma.id}, NULL,
      309, 10,
      'ATIVO', ${agora},
      ${agora}, ${agora}
    )
    RETURNING id
  `
  const alunoId = aluno[0].id
  console.log(`✅ Adriano Devegili criado (id: ${alunoId})`)

  await p.$executeRaw`
    INSERT INTO "Mensalidade" (id, "alunoId", numero, valor, vencimento, pago, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${alunoId}, 1, 309, ${vencimento}, false, ${agora}, ${agora})
  `
  console.log(`✅ Parcela criada: R$309 — vencimento ${vencimento.toLocaleDateString('pt-BR')}`)
}

main().catch(console.error).finally(() => process.exit(0))
