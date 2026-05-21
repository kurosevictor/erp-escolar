import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const turmas = await p.$queryRaw<{ id: string; curso: string; horario: string }[]>`
    SELECT id, curso, horario FROM "Turma"
    WHERE curso ILIKE '%solda%' AND horario ILIKE '%18%' LIMIT 1
  `
  if (!turmas.length) { console.log('Turma nao encontrada'); return }
  const turma = turmas[0]
  console.log(`Turma: ${turma.curso} - ${turma.horario}`)

  const aluno = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento",
      "turmaId",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Charlles Gomes Rodrigues',
      '61805206391',
      '47989155658',
      '15charllesgomes15@gmail.com',
      '2004-01-08',
      ${turma.id},
      2130,
      10,
      'ATIVO',
      NOW(),
      NOW(),
      NOW()
    ) RETURNING id
  `
  const alunoId = aluno[0].id
  console.log(`Aluno criado: ${alunoId}`)

  // Mensalidade de maio paga
  await p.$queryRaw`
    INSERT INTO "Mensalidade" (
      id, "alunoId", valor, vencimento, pago,
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      ${alunoId},
      2130,
      '2025-05-10',
      true,
      NOW(),
      NOW()
    )
  `
  console.log('Mensalidade maio R$2130 - PAGO')
}

main().catch(console.error).finally(() => p.$disconnect())
