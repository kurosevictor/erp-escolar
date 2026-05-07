import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const TURMAS_REFERENCIA = [
  { curso: 'Elétrica Residencial', turno: 'Quinta',  horario: '19:00' },
  { curso: 'Mecânica',             turno: 'Terça',   horario: '17:00' },
  { curso: 'Inglês Kids',          turno: 'Quinta',  horario: '10:40' },
  { curso: 'Mecânica de Moto',     turno: 'Quarta',  horario: '18:30' },
  { curso: 'Solda',                turno: 'Sábado',  horario: '10:00' },
  { curso: 'Solda',                turno: 'Sábado',  horario: '08:00' },
  { curso: 'Solda',                turno: 'Quarta',  horario: '20:00' },
  { curso: 'Solda',                turno: 'Segunda', horario: '17:00' },
  { curso: 'Elétrica Industrial',  turno: 'Quinta',  horario: '19:00' },
  { curso: 'Informática',          turno: 'Sábado',  horario: '10:00' },
  { curso: 'Inglês Intermediário', turno: 'Sábado',  horario: '08:00' },
  { curso: 'Mecânica de Moto',     turno: 'Quarta',  horario: '18:00' },
  { curso: 'Informática',          turno: 'Sábado',  horario: '08:30' },
  { curso: 'Inglês',               turno: 'Sábado',  horario: '10:00' },
  { curso: 'Administração',        turno: 'Sábado',  horario: '08:00' },
  { curso: 'Informática',          turno: 'Sábado',  horario: '08:00' },
  { curso: 'Mecânica de Carro',    turno: 'Sábado',  horario: '08:00' },
  { curso: 'Inglês Avançado',      turno: 'Sábado',  horario: '10:00' },
]

function getCapacidade(nomeCurso: string): number {
  const nome = nomeCurso.toLowerCase()
  if (nome.includes('solda')) return 7
  if (nome.includes('mecânica') || nome.includes('mecanica')) return 12
  if (nome.includes('kids')) return 5
  return 10
}

async function main() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  try {
    const turmas = await prisma.turma.findMany({ select: { id: true, nome: true, curso: true, turno: true, horario: true } })

    console.log(`\n📚 ${turmas.length} turmas encontradas no banco.\n`)

    let atualizadas = 0
    for (const turma of turmas) {
      const cap = getCapacidade(turma.curso)
      await prisma.turma.update({ where: { id: turma.id }, data: { capacidade: cap } })
      console.log(`  ✓ ${turma.curso} (${turma.turno} ${turma.horario}) → capacidade ${cap}`)
      atualizadas++
    }

    console.log(`\n✅ ${atualizadas} turmas atualizadas.\n`)

    // Validar turmas da planilha de referência
    console.log('🔍 Validando turmas da planilha de referência...\n')
    const faltando: typeof TURMAS_REFERENCIA = []
    for (const ref of TURMAS_REFERENCIA) {
      const match = turmas.find(
        (t) =>
          t.curso.toLowerCase() === ref.curso.toLowerCase() &&
          t.turno.toLowerCase() === ref.turno.toLowerCase() &&
          t.horario === ref.horario
      )
      if (!match) faltando.push(ref)
    }

    if (faltando.length === 0) {
      console.log('  ✅ Todas as turmas da planilha foram encontradas no banco.\n')
    } else {
      console.log(`  ⚠️  ${faltando.length} turma(s) da planilha NÃO encontradas no banco:`)
      faltando.forEach((t) => console.log(`     - ${t.curso} | ${t.turno} | ${t.horario}`))
      console.log()
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
