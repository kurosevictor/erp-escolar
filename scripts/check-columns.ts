import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  // Verifica colunas da tabela Mensalidade e Aluno que podem ter anotação
  const cols = await p.$queryRaw<{column_name: string}[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Mensalidade' ORDER BY ordinal_position
  `
  console.log('Colunas Mensalidade:', cols.map(c => c.column_name).join(', '))

  const colsA = await p.$queryRaw<{column_name: string}[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'Aluno' AND column_name ILIKE '%anot%' OR (table_name = 'Aluno' AND column_name ILIKE '%obs%')
  `
  console.log('Aluno (anot/obs):', colsA.map(c => c.column_name).join(', '))
}
main().finally(() => p.$disconnect())
