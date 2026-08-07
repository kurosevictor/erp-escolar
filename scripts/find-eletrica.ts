import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
p.$queryRaw<any[]>`SELECT id, curso, horario, ativo FROM "Turma" WHERE curso ILIKE '%letrica%'`
  .then(r => r.forEach(t => console.log(t.id, t.curso, t.horario, t.ativo)))
  .finally(() => p.$disconnect())
