import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })
async function main() {
  // Adiciona coluna se não existir
  await p.$executeRawUnsafe(`ALTER TABLE "Aluno" ADD COLUMN IF NOT EXISTS "turmaId3" TEXT`)
  console.log('Coluna turmaId3 ok')

  // Cria index se não existir
  await p.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Aluno_turmaId3_idx" ON "Aluno"("turmaId3")`)
  console.log('Index ok')

  // FK: só cria se não existir (via DO block)
  await p.$executeRawUnsafe(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Aluno_turmaId3_fkey'
      ) THEN
        ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId3_fkey"
          FOREIGN KEY ("turmaId3") REFERENCES "Turma"(id)
          ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$
  `)
  console.log('FK ok')
}
main().catch(console.error).finally(() => p.$disconnect())
