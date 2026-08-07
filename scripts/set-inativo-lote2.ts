import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  const nomes = ['Jorge Luis', 'Alexander', 'Wendell']
  for (const nome of nomes) {
    const a = await p.aluno.findFirst({
      where: { nome: { contains: nome, mode: 'insensitive' }, deletedAt: null },
      select: { id: true, nome: true, situacaoMatricula: true }
    })
    if (!a) { console.log(`NÃO ENCONTRADO: ${nome}`); continue }
    await p.aluno.update({ where: { id: a.id }, data: { situacaoMatricula: 'INATIVO' } })
    console.log(`INATIVO: ${a.nome}`)
  }
}
main().catch(console.error).finally(() => p.$disconnect())
