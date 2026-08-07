import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
async function main() {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT a.id, a.nome, a.cpf, m.valor, m.pago, m.vencimento
    FROM "Aluno" a
    LEFT JOIN "Mensalidade" m ON m."alunoId" = a.id AND m."deletedAt" IS NULL
    WHERE a.cpf = '61805206391' AND a."deletedAt" IS NULL
  `
  console.log(JSON.stringify(rows, null, 2))
}
main().finally(() => prisma.$disconnect())
