import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const TURMA_INGLES_BASICO   = 'cmoss4fi6000bnsbmmvivrn9i' // Inglês Básico Sábado 10-12
const TURMA_MEC_MOTOS_SAB   = 'cmoss4f6r0009nsbm19yp2lbs' // Mecânica de Motos Sábado 09-11
const TURMA_ELETRICA_QUINTA = 'cmoss4ek30005nsbmxhj5nnih' // Elétrica Residencial Quinta 18:30

async function main() {

  // ─── 1. LUIZA MOREIRA SCHISLOVICZ (menor — responsável: Daiani Moreira) ───
  const luiza = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento", "turmaId",
      "valorMensalidade", "diaVencimento",
      "cpfResponsavel",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Luiza Moreira Schislovicz',
      '13805914903',
      '47991869381',
      'luizaschislovicz@gmail.com',
      '2012-07-16',
      ${TURMA_INGLES_BASICO},
      239.90, 8,
      '05276862982',
      'ATIVO', NOW(), NOW(), NOW()
    ) RETURNING id
  `
  const luizaId = luiza[0].id
  // Primeira parcela: junho 08/06
  await p.parcela.create({ data: { numero: 1, valor: 239.90, vencimento: new Date('2026-06-08'), pago: false, alunoId: luizaId } })
  console.log('LUIZA criada - Inglês Básico Sábado 10-12 | 1ª parcela R$239,90 em 08/06')

  // ─── 2. BRUNO RAFAEL DOS PASSOS DA SILVEIRA ───
  const bruno = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento", "turmaId",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Bruno Rafael dos Passos da Silveira',
      '10681813970',
      '47992678636',
      'bruhrsk7@hotmail.com',
      '1998-04-30',
      ${TURMA_MEC_MOTOS_SAB},
      349.90, 10,
      'ATIVO', NOW(), NOW(), NOW()
    ) RETURNING id
  `
  const brunoId = bruno[0].id
  // Maio 14/05 PAGO PIX
  await p.parcela.create({ data: { numero: 1, valor: 299.90, vencimento: new Date('2026-05-14'), pago: true, dataPagamento: new Date('2026-05-14'), alunoId: brunoId } })
  // Junho 10/06 pendente
  await p.parcela.create({ data: { numero: 2, valor: 299.90, vencimento: new Date('2026-06-10'), pago: false, alunoId: brunoId } })
  console.log('BRUNO criado - Mecânica de Motos Sábado 09-11 | maio PAGO (PIX) | junho R$299,90 pendente')

  // ─── 3. TIAGO FRANCISCO STINGHEN ───
  const tiago = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento", "turmaId",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Tiago Francisco Stinghen',
      '04832038907',
      '4799441817',
      'tiagotinghenenzo77@gmail.com',
      '1987-08-10',
      ${TURMA_ELETRICA_QUINTA},
      299.90, 8,
      'ATIVO', NOW(), NOW(), NOW()
    ) RETURNING id
  `
  const tiagoId = tiago[0].id
  // Junho 08/06 pendente
  await p.parcela.create({ data: { numero: 1, valor: 249.90, vencimento: new Date('2026-06-08'), pago: false, alunoId: tiagoId } })
  console.log('TIAGO criado - Elétrica Residencial Quinta 18:30-20:30 | 1ª parcela R$249,90 em 08/06')
}

main().catch(console.error).finally(() => p.$disconnect())
