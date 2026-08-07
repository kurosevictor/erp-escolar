import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const turma = await p.turma.findFirst({ where: { curso: { contains: 'Residencial' }, ativo: true } })
  if (!turma) { console.log('Turma não encontrada'); return }

  const aluno = await p.aluno.findFirst({
    where: { nome: { contains: 'Everton', mode: 'insensitive' }, deletedAt: null },
    include: { turma: true }
  })
  if (!aluno) { console.log('Everton não encontrado'); return }

  await p.aluno.update({ where: { id: aluno.id }, data: { turmaId: turma.id, turmaId2: null, turmaId3: null } })
  console.log(`${aluno.nome}: ${aluno.turma.curso} → ${turma.curso} ${turma.horario}`)
}
main().catch(console.error).finally(() => p.$disconnect())
