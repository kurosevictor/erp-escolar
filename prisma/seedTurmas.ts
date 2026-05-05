import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const turmas = [
    { nome: 'Solda - Turma 1', curso: 'Solda', turno: 'Noite', horario: 'Quarta 18:00–20:00' },
    { nome: 'Solda - Turma 2', curso: 'Solda', turno: 'Noite', horario: 'Quarta 20:00–22:00' },
    { nome: 'Solda - Turma 3', curso: 'Solda', turno: 'Manhã', horario: 'Sábado 08:00–10:00' },
    { nome: 'Solda - Turma 4', curso: 'Solda', turno: 'Manhã', horario: 'Sábado 10:00–12:00' },
    { nome: 'Elétrica Industrial - Turma 1', curso: 'Elétrica Industrial', turno: 'Noite', horario: 'Quinta 19:00–21:00' },
    { nome: 'Elétrica Residencial - Turma 1', curso: 'Elétrica Residencial', turno: 'Noite', horario: 'Quarta 18:30–20:30' },
    { nome: 'Mecânica de Carros - Turma 1', curso: 'Mecânica de Carros', turno: 'Noite', horario: 'Terça 19:00–22:00' },
    { nome: 'Mecânica de Carros - Turma 2', curso: 'Mecânica de Carros', turno: 'Manhã', horario: 'Sábado 09:00–11:00' },
    { nome: 'Mecânica de Motos - Turma 1', curso: 'Mecânica de Motos', turno: 'Noite', horario: 'Segunda 19:00–22:00' },
    { nome: 'Mecânica de Motos - Turma 2', curso: 'Mecânica de Motos', turno: 'Manhã', horario: 'Sábado 09:00–11:00' },
    { nome: 'Inglês 2 - Turma 1', curso: 'Inglês', turno: 'Manhã', horario: 'Sábado 08:00–10:00' },
    { nome: 'Inglês 1 - Turma 2', curso: 'Inglês', turno: 'Manhã', horario: 'Sábado 10:00–12:00' },
    { nome: 'Inglês Kids - Turma 3', curso: 'Inglês', turno: 'Manhã', horario: 'Sábado 08:00–10:00' },
    { nome: 'Inglês 3 - Turma 4', curso: 'Inglês', turno: 'Manhã', horario: 'Sábado 10:00–12:00' },
    { nome: 'Administração - Turma 1', curso: 'Administração / Secretariado', turno: 'Manhã', horario: 'Sábado 08:00–10:00' },
    { nome: 'Informática - Turma 1', curso: 'Informática', turno: 'Noite', horario: 'Quinta 18:00–19:30' },
    { nome: 'Informática - Turma 2', curso: 'Informática', turno: 'Manhã', horario: 'Sábado 08:30–10:00' },
    { nome: 'Informática - Turma 3', curso: 'Informática', turno: 'Manhã', horario: 'Sábado 10:00–11:30' },
    { nome: 'Tanatopraxia - Intensivo', curso: 'Tanatopraxia', turno: 'Intensivo', horario: 'A definir' },
    { nome: 'Empreendedorismo - Intensivo', curso: 'Empreendedorismo', turno: 'Intensivo', horario: 'A definir' },
    { nome: 'Espanhol - Intensivo', curso: 'Espanhol', turno: 'Intensivo', horario: 'A definir' },
  ]

  for (const turma of turmas) {
    await prisma.turma.create({ data: turma })
  }

  console.log(`✅ ${turmas.length} turmas cadastradas`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
