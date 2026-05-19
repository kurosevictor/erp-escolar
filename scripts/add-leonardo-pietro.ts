import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const turmas = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma"
    WHERE curso ILIKE '%mecânica de carro%' AND horario ILIKE '%sábado%' LIMIT 1
  `
  if (!turmas.length) { console.log('❌ Turma não encontrada'); return }
  const turma = turmas[0]
  console.log(`Turma: ${turma.curso} — ${turma.horario}`)

  const agora = new Date()
  const dataNascimento = new Date('2005-09-14')
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
      'Leonardo Pietro Nunes Pedrozo',
      '05369039054',
      '984377385',
      'lp036040@gmail.com',
      ${dataNascimento},
      ${turma.id}, NULL,
      299.90, 10,
      'ATIVO', ${agora},
      ${agora}, ${agora}
    )
    RETURNING id
  `
  const alunoId = aluno[0].id
  console.log(`✅ Leonardo Pietro Nunes Pedrozo criado (id: ${alunoId})`)

  await p.$executeRaw`
    INSERT INTO "Mensalidade" (id, "alunoId", numero, valor, vencimento, pago, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${alunoId}, 1, 299.90, ${vencimento}, false, ${agora}, ${agora})
  `
  console.log(`✅ Parcela criada: R$299,90 — vencimento ${vencimento.toLocaleDateString('pt-BR')}`)
}

main().catch(console.error).finally(() => process.exit(0))
