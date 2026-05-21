import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const turmas = await p.turma.findMany({ where: { ativo: true }, select: { id: true, curso: true, horario: true } })
  console.log('=== INGLES BASICO ===')
  turmas.filter(t => t.curso.includes('sico') || t.curso.includes('B')).forEach(t => console.log(t.id, t.curso, t.horario))
  console.log('=== MECANICA MOTOS ===')
  turmas.filter(t => t.curso.toLowerCase().includes('moto')).forEach(t => console.log(t.id, t.curso, t.horario))
  console.log('=== ELETRICA ===')
  turmas.filter(t => t.curso.toLowerCase().includes('letrica') || t.curso.toLowerCase().includes('residencial')).forEach(t => console.log(t.id, t.curso, t.horario))
}
main().finally(() => p.$disconnect())
