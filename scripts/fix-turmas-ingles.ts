import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()

  // Busca turmas existentes de Inglês
  const existentes = await p.$queryRaw<{ id: string; nome: string; curso: string; turno: string; horario: string }[]>`
    SELECT id, nome, curso, turno, horario FROM "Turma" WHERE curso ILIKE '%ingl%' ORDER BY horario
  `
  console.log('Turmas existentes:', JSON.stringify(existentes, null, 2))

  const ingles800 = existentes.find(t => t.horario === 'Sábado 08:00–10:00')
  const ingles1000 = existentes.find(t => t.horario === 'Sábado 10:00–12:00')

  if (!ingles800 || !ingles1000) { console.log('❌ Turmas não encontradas'); return }

  // 1. Renomeia Inglês 08:00 → Inglês Intermediário
  await p.$executeRaw`
    UPDATE "Turma" SET curso = 'Inglês Intermediário', nome = 'Inglês Intermediário - Sábado 08:00–10:00', "updatedAt" = ${agora}
    WHERE id = ${ingles800.id}
  `
  console.log('✅ Renomeado: Inglês Intermediário — Sábado 08:00–10:00')

  // 2. Cria turma Inglês Kids 08:00–10:00
  const kidsRows = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Turma" (id, nome, curso, turno, horario, ativo, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'Inglês Kids - Sábado 08:00–10:00',
      'Inglês Kids',
      ${ingles800.turno},
      'Sábado 08:00–10:00',
      true,
      ${agora}, ${agora}
    )
    RETURNING id
  `
  const kidsId = kidsRows[0].id
  console.log(`✅ Criado: Inglês Kids — Sábado 08:00–10:00 (id: ${kidsId})`)

  // 3. Move Beatriz e Heloysa para Kids
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${kidsId}, "updatedAt" = ${agora}
    WHERE nome IN ('Beatriz Kruger', 'Heloysa Dutra') AND "deletedAt" IS NULL
  `
  console.log('✅ Beatriz Kruger + Heloysa Dutra → Inglês Kids')

  // 4. Renomeia Inglês 10:00 → Inglês Básico
  await p.$executeRaw`
    UPDATE "Turma" SET curso = 'Inglês Básico', nome = 'Inglês Básico - Sábado 10:00–12:00', "updatedAt" = ${agora}
    WHERE id = ${ingles1000.id}
  `
  console.log('✅ Renomeado: Inglês Básico — Sábado 10:00–12:00')

  // 5. Cria turma Inglês Avançado 10:00–12:00
  const avRows = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Turma" (id, nome, curso, turno, horario, ativo, "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      'Inglês Avançado - Sábado 10:00–12:00',
      'Inglês Avançado',
      ${ingles1000.turno},
      'Sábado 10:00–12:00',
      true,
      ${agora}, ${agora}
    )
    RETURNING id
  `
  const avId = avRows[0].id
  console.log(`✅ Criado: Inglês Avançado — Sábado 10:00–12:00 (id: ${avId})`)

  // 6. Move Eliza e Daniel para Avançado (turmaId)
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${avId}, "updatedAt" = ${agora}
    WHERE nome IN ('Eliza Cristina', 'Daniel Reliquias') AND "deletedAt" IS NULL
  `
  console.log('✅ Eliza Cristina + Daniel Reliquias → Inglês Avançado')
}

main().catch(console.error).finally(() => process.exit(0))
