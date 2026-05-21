import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
  const turmas = await p.turma.findMany({
    where: { curso: { contains: 'Solda' }, ativo: true },
    select: { id: true, curso: true, horario: true }
  })
  const turma = turmas.find(t => t.horario.includes('08'))
  if (!turma) { console.log('Turma não encontrada. Turmas de Solda:'); turmas.forEach(t => console.log(t.id, t.horario)); return }
  console.log(`Turma: ${turma.curso} - ${turma.horario}`)

  const aluno = await p.$queryRaw<{ id: string }[]>`
    INSERT INTO "Aluno" (
      id, nome, cpf, telefone, email,
      "dataNascimento", "turmaId",
      "valorMensalidade", "diaVencimento",
      "situacaoMatricula", "dataMatricula",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      'Sara Dionizio',
      '10662252900',
      '4799979760',
      'saradionizio97@gmail.com',
      '1997-11-08',
      ${turma.id},
      575.00, 8,
      'ATIVO', NOW(), NOW(), NOW()
    ) RETURNING id
  `
  const alunoId = aluno[0].id
  console.log(`Aluno criado: ${alunoId}`)

  // 4 parcelas a partir de junho — todas pendentes
  const vencimentos = [
    new Date('2026-06-08'),
    new Date('2026-07-08'),
    new Date('2026-08-08'),
    new Date('2026-09-08'),
  ]
  for (let i = 0; i < vencimentos.length; i++) {
    await p.parcela.create({ data: { numero: i + 1, valor: 575.00, vencimento: vencimentos[i], pago: false, alunoId } })
  }
  console.log('4 parcelas criadas: jun/jul/ago/set — R$575,00 cada (pendente)')
}

main().catch(console.error).finally(() => p.$disconnect())
