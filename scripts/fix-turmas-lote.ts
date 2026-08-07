import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  // Descobre turmas necessárias
  const turmas = await p.turma.findMany({
    where: { ativo: true },
    select: { id: true, curso: true, horario: true }
  })

  const soldaSab10  = turmas.find(t => t.curso.includes('Solda') && t.horario.includes('10:00'))
  const soldaQua18  = turmas.find(t => t.curso.includes('Solda') && t.horario.includes('18'))
  const mecMotoSeg  = turmas.find(t => t.curso.includes('Motos') && t.horario.includes('Segunda'))

  console.log('Turmas encontradas:')
  console.log(' Solda Sáb 10h:', soldaSab10?.horario ?? 'NÃO ENCONTRADA')
  console.log(' Solda Qua 18h:', soldaQua18?.horario ?? 'NÃO ENCONTRADA')
  console.log(' Mec Motos Seg:', mecMotoSeg?.horario ?? 'NÃO ENCONTRADA')

  if (!soldaSab10 || !soldaQua18 || !mecMotoSeg) { console.log('Abortando'); return }

  const alunos = [
    { nome: 'Daniel Ferreira',  turmaId: soldaSab10.id },
    { nome: 'Thiago de Oliveira', turmaId: soldaQua18.id },
    { nome: 'Luis Henrique',    turmaId: mecMotoSeg.id },
    { nome: 'Carlos Eduardo',   turmaId: mecMotoSeg.id },
    { nome: 'Wendell',          turmaId: mecMotoSeg.id },
  ]

  for (const { nome, turmaId } of alunos) {
    const found = await p.aluno.findFirst({
      where: { nome: { contains: nome, mode: 'insensitive' }, deletedAt: null },
      select: { id: true, nome: true, turma: { select: { curso: true, horario: true } } }
    })
    if (!found) { console.log(`NÃO ENCONTRADO: ${nome}`); continue }

    await p.aluno.update({ where: { id: found.id }, data: { turmaId, turmaId2: null, turmaId3: null } })
    const nova = turmas.find(t => t.id === turmaId)
    console.log(`OK: ${found.nome} → ${nova?.curso} ${nova?.horario}`)
  }
}

main().catch(console.error).finally(() => p.$disconnect())
