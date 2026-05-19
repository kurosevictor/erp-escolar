import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  // Busca a turma de Informática Sábado 10:00–11:30
  const turmas = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma"
    WHERE curso ILIKE '%informática%' AND horario = 'Sábado 10:00–11:30'
    LIMIT 1
  `
  if (!turmas.length) { console.log('❌ Turma não encontrada'); return }
  const turma = turmas[0]
  console.log(`✅ Turma encontrada: ${turma.curso} — ${turma.horario} (id: ${turma.id})`)

  // Cria o aluno
  const agora = new Date()
  const alunos = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "turmaId", "turmaId2",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Arthur Dias',
      'SEM_CPF_ARTHUR_DIAS',
      'SEM_TELEFONE_ARTHUR_DIAS',
      'SEM_EMAIL_ARTHUR_DIAS',
      ${turma.id}, NULL,
      0, 8,
      'ATIVO', ${agora},
      ${agora}, ${agora}
    )
    RETURNING id
  `
  const alunoId = alunos[0].id
  console.log(`✅ Arthur Dias criado (id: ${alunoId})`)

  // Cria parcela do mês atual com valor 0 e vencimento dia 8
  const hoje = new Date()
  const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), 8)

  await p.$executeRaw`
    INSERT INTO "Mensalidade" (
      id, "alunoId", numero, valor, vencimento, pago,
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      ${alunoId},
      1,
      0,
      ${vencimento},
      false,
      ${agora}, ${agora}
    )
  `
  console.log(`✅ Parcela criada: R$0,00 — vencimento ${vencimento.toLocaleDateString('pt-BR')}`)
}

main().catch(console.error).finally(() => process.exit(0))
