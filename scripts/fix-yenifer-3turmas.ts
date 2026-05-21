import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const TURMA_INFO_QUINTA = 'cmoss4g4v000fnsbm2bq7iu9r' // Informática Quinta 18:00–19:30
const TURMA_INFO_SAB    = 'cmoss4gg6000hnsbmmsytagv9'  // Informática Sábado 10:00–11:30
const YENIFER_ID        = 'cmosuqp5l002pqsbme807poq4'

async function main() {
  await p.$executeRaw`
    UPDATE "Aluno"
    SET "turmaId2" = ${TURMA_INFO_QUINTA},
        "turmaId3" = ${TURMA_INFO_SAB},
        "updatedAt" = NOW()
    WHERE id = ${YENIFER_ID}
  `
  console.log('Yenifer atualizada:')
  console.log(' Turma 1: Administração/Secretariado - Sábado 08:00-10:00 (mantida)')
  console.log(' Turma 2: Informática - Quinta 18:00-19:30')
  console.log(' Turma 3: Informática - Sábado 10:00-11:30')
}

main().catch(console.error).finally(() => p.$disconnect())
