import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  // Adiciona coluna turmaId2 se não existir
  await p.$executeRaw`
    ALTER TABLE "Aluno" ADD COLUMN IF NOT EXISTS "turmaId2" TEXT
  `
  console.log('✅ Coluna turmaId2 adicionada')

  // Adiciona foreign key se não existir
  await p.$executeRaw`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Aluno_turmaId2_fkey'
      ) THEN
        ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId2_fkey"
        FOREIGN KEY ("turmaId2") REFERENCES "Turma"(id) ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$
  `
  console.log('✅ Foreign key adicionada')

  // Adiciona índice
  await p.$executeRaw`
    CREATE INDEX IF NOT EXISTS "Aluno_turmaId2_idx" ON "Aluno"("turmaId2")
  `
  console.log('✅ Índice criado')
}

main().catch(console.error).finally(() => process.exit(0))
