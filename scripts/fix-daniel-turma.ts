import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const turmas = await p.turma.findMany({
    where: { curso: { contains: 'Solda' }, ativo: true },
    select: { id: true, curso: true, horario: true }
  })
  console.log('Turmas de Solda:')
  turmas.forEach(t => console.log(' ', t.id, t.horario))

  // Sábado que COMEÇA às 10
  const soldaSab10 = turmas.find(t => t.horario.startsWith('Sábado 10'))
  if (!soldaSab10) { console.log('Turma Sábado 10h não encontrada'); return }

  const daniel = await p.aluno.findFirst({
    where: { nome: { contains: 'Daniel Ferreira', mode: 'insensitive' }, deletedAt: null }
  })
  if (!daniel) { console.log('Daniel não encontrado'); return }

  await p.aluno.update({ where: { id: daniel.id }, data: { turmaId: soldaSab10.id } })
  console.log(`Daniel → ${soldaSab10.curso} ${soldaSab10.horario}`)
}

main().catch(console.error).finally(() => p.$disconnect())
