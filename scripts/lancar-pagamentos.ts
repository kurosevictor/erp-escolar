import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const hoje = new Date()
const mesAtual = hoje.getMonth() + 1
const anoAtual = hoje.getFullYear()

async function marcarPago(nomeFragmento: string, valorPago: number, anotacao: string) {
  // Busca aluno
  const alunos = await p.$queryRaw<{ id: string; nome: string }[]>`
    SELECT id, nome FROM "Aluno"
    WHERE LOWER(nome) LIKE ${'%' + nomeFragmento.toLowerCase() + '%'}
      AND "deletedAt" IS NULL
    LIMIT 1
  `
  if (alunos.length === 0) {
    console.log(`❌ Aluno não encontrado: "${nomeFragmento}"`)
    return
  }
  const aluno = alunos[0]

  // Busca parcela do mês atual
  const parcelas = await p.$queryRaw<{ id: string; valor: number; pago: boolean }[]>`
    SELECT id, valor, pago FROM "Mensalidade"
    WHERE "alunoId" = ${aluno.id}
      AND "deletedAt" IS NULL
      AND EXTRACT(MONTH FROM vencimento) = ${mesAtual}
      AND EXTRACT(YEAR FROM vencimento) = ${anoAtual}
    LIMIT 1
  `
  if (parcelas.length === 0) {
    console.log(`⚠️  Parcela do mês não encontrada para: ${aluno.nome}`)
    return
  }
  const parcela = parcelas[0]

  if (parcela.pago) {
    console.log(`✅ Já estava pago: ${aluno.nome}`)
    return
  }

  // Marca como pago com o valor informado
  await p.$executeRaw`
    UPDATE "Mensalidade"
    SET pago = true, "dataPagamento" = ${hoje}, valor = ${valorPago}, "updatedAt" = ${hoje}
    WHERE id = ${parcela.id}
  `

  // Atualiza anotacaoFinanceiro no aluno
  await p.$executeRaw`
    UPDATE "Aluno"
    SET "anotacaoFinanceiro" = ${anotacao}, "updatedAt" = ${hoje}
    WHERE id = ${aluno.id}
  `

  console.log(`✅ Pago: ${aluno.nome} — R$ ${valorPago.toFixed(2).replace('.', ',')} | ${anotacao}`)
}

async function marcarPagoEAtualizarFuturas(nomeFragmento: string, novoValor: number, anotacao: string) {
  const alunos = await p.$queryRaw<{ id: string; nome: string }[]>`
    SELECT id, nome FROM "Aluno"
    WHERE LOWER(nome) LIKE ${'%' + nomeFragmento.toLowerCase() + '%'}
      AND "deletedAt" IS NULL
    LIMIT 1
  `
  if (alunos.length === 0) {
    console.log(`❌ Aluno não encontrado: "${nomeFragmento}"`)
    return
  }
  const aluno = alunos[0]

  // Marca parcela do mês como pago com novo valor
  await p.$executeRaw`
    UPDATE "Mensalidade"
    SET pago = true, "dataPagamento" = ${hoje}, valor = ${novoValor}, "updatedAt" = ${hoje}
    WHERE "alunoId" = ${aluno.id}
      AND "deletedAt" IS NULL
      AND EXTRACT(MONTH FROM vencimento) = ${mesAtual}
      AND EXTRACT(YEAR FROM vencimento) = ${anoAtual}
  `

  // Atualiza todas as parcelas futuras não pagas para o novo valor
  const futuras = await p.$executeRaw`
    UPDATE "Mensalidade"
    SET valor = ${novoValor}, "updatedAt" = ${hoje}
    WHERE "alunoId" = ${aluno.id}
      AND "deletedAt" IS NULL
      AND pago = false
      AND vencimento > ${hoje}
  `

  // Atualiza valorMensalidade e anotacao no aluno
  await p.$executeRaw`
    UPDATE "Aluno"
    SET "valorMensalidade" = ${novoValor}, "anotacaoFinanceiro" = ${anotacao}, "updatedAt" = ${hoje}
    WHERE id = ${aluno.id}
  `

  console.log(`✅ Pago + valor atualizado para R$ ${novoValor.toFixed(2).replace('.', ',')}: ${aluno.nome} (futuras também atualizadas) | ${anotacao}`)
}

async function main() {
  console.log('\n=== LANÇANDO PAGAMENTOS ===\n')

  // Junior Bueno — novo valor fixo 309
  await marcarPagoEAtualizarFuturas('junior bueno', 309.00, 'Pix Nubank')

  // Diones — pagou 249,00 (valor atualizado para o que pagou)
  await marcarPago('diones andre', 249.00, 'Pix Nubank')

  // Matheus de Brum — pago por Roque de Brum Conceição
  await marcarPago('matheus de brum', 250.00, 'Pix Nubank - pago por Roque de Brum Conceição')

  // João Gabriel Wortmeyer — pago por Rodrigo Tolentino
  await marcarPago('joao gabriel wortmeyer', 209.90, 'Pix Nubank - pago por Rodrigo Tolentino')

  // Uendson Santana
  await marcarPago('uendson santana', 250.00, 'Pix Nubank')

  // Juliano Reiguel — pago por Nicoly
  await marcarPago('reiguel', 249.00, 'Pix Nubank - pago por Nicoly')

  // Alex Senem
  await marcarPago('alex senem', 250.00, 'Pix Nubank')

  // Fernando Senem (irmão do Alex)
  await marcarPago('fernando senem', 250.00, 'Pix Nubank')

  // Celio Rodrigues
  await marcarPago('celio rodrigues', 250.00, 'Pix Nubank')

  console.log('\n=== CONCLUÍDO ===\n')
}

main().catch(console.error).finally(() => process.exit(0))
