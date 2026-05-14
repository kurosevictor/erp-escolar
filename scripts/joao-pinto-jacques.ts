import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

const hoje = new Date()

async function main() {
  // === JOÃO PINTO ===
  // Zera e marca como pago todas as parcelas até outubro/2026
  const zeradas = await p.$executeRaw`
    UPDATE "Mensalidade" m
    SET valor = 0, pago = true, "dataPagamento" = ${hoje}, "updatedAt" = ${hoje}
    FROM "Aluno" a
    WHERE m."alunoId" = a.id
      AND a.nome ILIKE '%joão pinto%'
      AND m."deletedAt" IS NULL
      AND m.pago = false
      AND m.vencimento <= '2026-10-31'
  `
  console.log(`✅ João Pinto: ${zeradas} parcela(s) zerada(s) e marcadas como pagas (até out/2026)`)

  // A partir de novembro/2026 → valor 250
  const atualizadas = await p.$executeRaw`
    UPDATE "Mensalidade" m
    SET valor = 250, "updatedAt" = ${hoje}
    FROM "Aluno" a
    WHERE m."alunoId" = a.id
      AND a.nome ILIKE '%joão pinto%'
      AND m."deletedAt" IS NULL
      AND m.vencimento >= '2026-11-01'
  `
  console.log(`✅ João Pinto: ${atualizadas} parcela(s) a partir de nov/2026 → R$ 250,00`)

  // === JACQUES AMARAL ===
  await p.$executeRaw`
    UPDATE "Mensalidade" m
    SET pago = true, "dataPagamento" = ${hoje}, "updatedAt" = ${hoje}
    FROM "Aluno" a
    WHERE m."alunoId" = a.id
      AND a.nome ILIKE '%jacques amaral%'
      AND m."deletedAt" IS NULL
      AND m.pago = false
      AND EXTRACT(MONTH FROM m.vencimento) = ${hoje.getMonth() + 1}
      AND EXTRACT(YEAR FROM m.vencimento) = ${hoje.getFullYear()}
  `

  const jacques = await p.$queryRaw<{ id: string }[]>`
    SELECT a.id FROM "Aluno" a WHERE a.nome ILIKE '%jacques amaral%' AND a."deletedAt" IS NULL LIMIT 1
  `
  if (jacques.length) {
    await p.$executeRaw`
      UPDATE "Aluno" SET "anotacaoFinanceiro" = 'Pix Nubank', "updatedAt" = ${hoje} WHERE id = ${jacques[0].id}
    `
  }
  console.log(`✅ Jacques Amaral: marcado como pago — Pix Nubank`)
}

main().catch(console.error).finally(() => process.exit(0))
