import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const a = await p.aluno.findFirst({
    where: { nome: { contains: 'Yenifer', mode: 'insensitive' }, deletedAt: null },
    include: { turma: true, turma2: true }
  })
  if (!a) { console.log('Não encontrada'); return }
  console.log('ID:', a.id)
  console.log('Nome:', a.nome)
  console.log('Turma 1:', a.turma?.curso, a.turma?.horario)
  console.log('Turma 2:', a.turma2?.curso, a.turma2?.horario)

  // Busca turmas de informática
  console.log('\n=== Turmas de Informática ===')
  const turmas = await p.turma.findMany({ where: { curso: { contains: 'nform' }, ativo: true }, select: { id: true, curso: true, horario: true } })
  turmas.forEach(t => console.log(t.id, t.curso, t.horario))
}
main().finally(() => p.$disconnect())
