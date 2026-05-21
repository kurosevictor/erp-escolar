import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const rows = await p.turma.findMany({
    where: { curso: { contains: 'Residencial' }, ativo: true },
    select: { id: true, curso: true, horario: true }
  })
  rows.forEach(t => console.log(t.id, '|', t.curso, '|', t.horario))
}
main().finally(() => p.$disconnect())
