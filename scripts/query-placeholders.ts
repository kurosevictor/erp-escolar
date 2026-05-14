import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const rows = await p.$queryRaw<{ nome: string; cpf: string; telefone: string | null; email: string | null }[]>`
    SELECT nome, cpf, telefone, email
    FROM "Aluno"
    WHERE "deletedAt" IS NULL
      AND "situacaoMatricula" = 'ATIVO'
      AND (
        cpf LIKE '%000000000%'
        OR cpf LIKE '000%'
        OR cpf LIKE '111%'
        OR cpf LIKE '999%'
        OR cpf = '00000000000'
        OR cpf = '11111111111'
        OR cpf = '99999999999'
        OR cpf LIKE '%placeholder%'
        OR telefone LIKE '(00)%'
        OR telefone LIKE '00000%'
        OR telefone LIKE '(99)%'
        OR telefone LIKE '99999%'
        OR telefone = '0000000000'
        OR telefone = '00000000000'
        OR telefone IS NULL
        OR telefone = ''
        OR cpf IS NULL
        OR cpf = ''
      )
    ORDER BY nome ASC
  `

  console.log(`\n=== ALUNOS COM DADOS INCOMPLETOS/PLACEHOLDER ===\n`)
  console.log(`Total: ${rows.length}\n`)

  for (const r of rows) {
    const cpfFlag = !r.cpf || r.cpf.includes('000') || r.cpf.includes('111') || r.cpf.includes('999') ? '⚠️ CPF' : ''
    const telFlag = !r.telefone || r.telefone === '' || r.telefone.startsWith('(00)') || r.telefone.startsWith('00') || r.telefone.startsWith('(99)') ? '⚠️ TEL' : ''
    console.log(`${r.nome}`)
    console.log(`  CPF: ${r.cpf || '—'}  ${cpfFlag}`)
    console.log(`  Tel: ${r.telefone || '—'}  ${telFlag}`)
    console.log()
  }
}

main().catch(console.error).finally(() => process.exit(0))
