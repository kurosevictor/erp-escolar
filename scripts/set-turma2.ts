import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const agora = new Date()

async function getTurma(curso: string, horario: string) {
  const rows = await p.$queryRaw<{ id: string; nome: string; curso: string; horario: string }[]>`
    SELECT id, nome, curso, horario FROM "Turma"
    WHERE curso ILIKE ${'%' + curso + '%'} AND horario ILIKE ${'%' + horario + '%'} AND ativo = true
    LIMIT 1
  `
  if (!rows.length) { console.log(`❌ Turma não encontrada: ${curso} / ${horario}`); return null }
  return rows[0]
}

async function setTurmas(nomeAluno: string, curso1: string, horario1: string, curso2: string, horario2: string) {
  const [alunos, t1, t2] = await Promise.all([
    p.$queryRaw<{ id: string; nome: string }[]>`SELECT id, nome FROM "Aluno" WHERE nome ILIKE ${'%' + nomeAluno + '%'} AND "deletedAt" IS NULL LIMIT 1`,
    getTurma(curso1, horario1),
    getTurma(curso2, horario2),
  ])

  if (!alunos.length) { console.log(`❌ Aluno não encontrado: ${nomeAluno}`); return }
  if (!t1 || !t2) return

  const aluno = alunos[0]
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${t1.id}, "turmaId2" = ${t2.id}, "updatedAt" = ${agora}
    WHERE id = ${aluno.id}
  `
  console.log(`✅ ${aluno.nome}`)
  console.log(`   Turma 1: ${t1.curso} — ${t1.horario}`)
  console.log(`   Turma 2: ${t2.curso} — ${t2.horario}`)
}

async function main() {
  console.log('\n=== CADASTRANDO SEGUNDAS TURMAS ===\n')

  // Otávio Luis: Mecânica de Carros Sáb + Informática Qui
  await setTurmas('Otavio Luis', 'Mecânica de Carros', 'Sábado', 'Informática', 'Quinta')

  // Milena: Administração Sáb 08:00 + Inglês Sáb 10:00
  await setTurmas('Milena Bender', 'Administração', 'Sábado', 'Inglês', '10:00')

  // Felipe Quadra: Inglês Sáb 08:00 + Informática Sáb 10:00-11:30
  await setTurmas('Felipe Quadra', 'Inglês', '08:00', 'Informática', '10:00')

  // Kauan Richter: Informática Sáb 08:30 + Inglês Sáb 10:00
  await setTurmas('Kauan Richter', 'Informática', '08:30', 'Inglês', '10:00')

  // Nicolas Eduardo: Informática Sáb 08:30 + Inglês Sáb 10:00
  await setTurmas('Nicolas Eduardo', 'Informática', '08:30', 'Inglês', '10:00')

  // Heloysa: Inglês Sáb 08:00 + Informática Sáb 10:00-11:30
  await setTurmas('Heloysa', 'Inglês', '08:00', 'Informática', '10:00–11:30')

  // Leonardo Thilles: Mecânica de Carros Terça + Mecânica de Motos Segunda
  await setTurmas('Leonardo Thilles', 'Mecânica de Carros', 'Terça', 'Mecânica de Motos', 'Segunda')

  console.log('\n✅ Concluído')
}

main().catch(console.error).finally(() => process.exit(0))
