import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

// IDs das turmas originais (manter)
const KIDS_ORIGINAL     = 'cmoss4fnu000cnsbmssn0rj7o'  // "Inglês Kids - Turma 3"
const INTERMEDIARIO     = 'cmoss4fck000ansbmu11px78q'   // "Inglês Intermediário" (já correto)
const AVANCADO_ORIGINAL = 'cmoss4ftk000dnsbmp7odn4sb'   // "Inglês 3 - Turma 4"
const BASICO            = 'cmoss4fi6000bnsbmmvivrn9i'   // "Inglês Básico" (já correto)

// IDs das duplicatas criadas por engano (apagar)
const KIDS_NOVO    = '31b87c6f-d730-41da-904f-096e4197975b'
const AVANCADO_NOVO = '552242f6-6021-4b3e-bd9b-b21a39e07e35'

async function main() {
  const agora = new Date()

  // 1. Renomeia turmas originais corretamente
  await p.$executeRaw`
    UPDATE "Turma" SET curso = 'Inglês Kids', nome = 'Inglês Kids - Sábado 08:00–10:00', "updatedAt" = ${agora}
    WHERE id = ${KIDS_ORIGINAL}
  `
  console.log('✅ Renomeado: Inglês Kids - Turma 3 → Inglês Kids')

  await p.$executeRaw`
    UPDATE "Turma" SET curso = 'Inglês Avançado', nome = 'Inglês Avançado - Sábado 10:00–12:00', "updatedAt" = ${agora}
    WHERE id = ${AVANCADO_ORIGINAL}
  `
  console.log('✅ Renomeado: Inglês 3 - Turma 4 → Inglês Avançado')

  // 2. Move Beatriz e Heloysa da turma Kids duplicada → Kids original
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${KIDS_ORIGINAL}, "updatedAt" = ${agora}
    WHERE "turmaId" = ${KIDS_NOVO} AND "deletedAt" IS NULL
  `
  console.log('✅ Beatriz + Heloysa → Inglês Kids (original)')

  // 3. Move Eliza e Daniel da turma Avançado duplicada → Avançado original
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${AVANCADO_ORIGINAL}, "updatedAt" = ${agora}
    WHERE "turmaId" = ${AVANCADO_NOVO} AND "deletedAt" IS NULL
  `
  console.log('✅ Eliza + Daniel → Inglês Avançado (original)')

  // 4. Move Bernardo e Isabela do Avançado → Básico
  await p.$executeRaw`
    UPDATE "Aluno" SET "turmaId" = ${BASICO}, "updatedAt" = ${agora}
    WHERE nome IN ('Bernardo Junkes', 'Isabela Furlani')
      AND "turmaId" = ${AVANCADO_ORIGINAL}
      AND "deletedAt" IS NULL
  `
  console.log('✅ Bernardo + Isabela → Inglês Básico')

  // 5. Apaga as turmas duplicatas (não têm chamadas ou outros vínculos)
  await p.$executeRaw`DELETE FROM "Turma" WHERE id = ${KIDS_NOVO}`
  await p.$executeRaw`DELETE FROM "Turma" WHERE id = ${AVANCADO_NOVO}`
  console.log('✅ Duplicatas removidas')
}

main().catch(console.error).finally(() => process.exit(0))
