import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const INGLES_BASICO = 'cmoss4fi6000bnsbmmvivrn9i' // Inglês Básico — Sábado 10:00–12:00

async function main() {
  // Busca turma de Informática na quinta
  const turmas = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma"
    WHERE curso ILIKE '%informática%' AND horario ILIKE '%quinta%'
    LIMIT 1
  `
  if (!turmas.length) { console.log('❌ Turma de Informática Quinta não encontrada'); return }
  const infQuinta = turmas[0]
  console.log(`Turma 2 encontrada: ${infQuinta.curso} — ${infQuinta.horario}`)

  const agora = new Date()

  const aluno = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "turmaId", "turmaId2",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Yasmin Raiski',
      '15113170941',
      '47 8910 3847',
      'Yasmin.lima@alunos.edu.jaraguadosul.sc.gov.br',
      ${INGLES_BASICO},
      ${infQuinta.id},
      0, 15,
      'ATIVO', ${agora},
      ${agora}, ${agora}
    )
    RETURNING id
  `
  const alunoId = aluno[0].id
  console.log(`✅ Yasmin Raiski criada (id: ${alunoId})`)

  // Parcela do mês atual
  const vencimento = new Date(agora.getFullYear(), agora.getMonth(), 15)
  await p.$executeRaw`
    INSERT INTO "Mensalidade" (id, "alunoId", numero, valor, vencimento, pago, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), ${alunoId}, 1, 0, ${vencimento}, false, ${agora}, ${agora})
  `
  console.log(`✅ Parcela criada: R$0,00 — vencimento ${vencimento.toLocaleDateString('pt-BR')}`)
}

main().catch(console.error).finally(() => process.exit(0))
