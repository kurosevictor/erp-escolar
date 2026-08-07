import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const YENIFER_ID     = 'cmosuqp5l002pqsbme807poq4'
const TURMA_INFO_QUI = 'cmoss4g4v000fnsbm2bq7iu9r'
const TURMA_INFO_SAB = 'cmoss4gg6000hnsbmmsytagv9'

async function main() {
  const orig = await p.aluno.findUnique({ where: { id: YENIFER_ID } })
  if (!orig) { console.log('Yenifer não encontrada'); return }

  const diaVenc = orig.diaVencimento ?? 10

  const nova = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento", "turmaId", "turmaId2",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Yenifer Fajardo Informatica',
      'INFORMATICA-YENIFER',
      ${orig.telefone ?? ''},
      ${orig.email ?? ''},
      ${orig.dataNascimento ?? null},
      ${TURMA_INFO_QUI},
      ${TURMA_INFO_SAB},
      169.00,
      ${diaVenc},
      'ATIVO',
      NOW(), NOW(), NOW()
    ) RETURNING id
  `
  const novaId = nova[0].id
  console.log(`Criada: Yenifer Fajardo Informatica — id ${novaId}`)

  await p.parcela.create({
    data: {
      numero: 1,
      valor: 169.00,
      vencimento: new Date(`2026-07-${String(diaVenc).padStart(2, '0')}`),
      pago: false,
      alunoId: novaId,
    }
  })
  console.log(`1ª parcela: R$169,00 em 2026-07-${String(diaVenc).padStart(2,'0')} — pendente`)
}

main().catch(console.error).finally(() => p.$disconnect())
