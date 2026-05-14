import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const agora = new Date()

  // Elétrica Industrial: Quinta → Quarta
  const industrial = await p.$executeRaw`
    UPDATE "Turma" SET horario = 'Quarta 19:00–21:00', turno = 'Noite', "updatedAt" = ${agora}
    WHERE curso = 'Elétrica Industrial'
  `
  console.log(`✅ Elétrica Industrial → Quarta 19:00–21:00 (${industrial} turma)`)

  // Elétrica Residencial: Quarta → Quinta
  const residencial = await p.$executeRaw`
    UPDATE "Turma" SET horario = 'Quinta 18:30–20:30', turno = 'Noite', "updatedAt" = ${agora}
    WHERE curso = 'Elétrica Residencial'
  `
  console.log(`✅ Elétrica Residencial → Quinta 18:30–20:30 (${residencial} turma)`)
}

main().catch(console.error).finally(() => process.exit(0))
