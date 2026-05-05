import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const alunosData = [
  { nome: 'Kauanny Maia', curso: 'Solda' },
  { nome: 'Kaue Maia', curso: 'Solda' },
  { nome: 'Shadi Yared', curso: 'Solda' },
  { nome: 'Juracir Silva Matos', curso: 'Solda' },
  { nome: 'Eduardo Lopes', curso: 'Solda' },
  { nome: 'Vanessa Fátima', curso: 'Inglês' },
  { nome: 'Beatriz Krueger', curso: 'Inglês' },
  { nome: 'Bernardo Junkes', curso: 'Inglês' },
  { nome: 'Bruna Pickler', curso: 'Inglês' },
  { nome: 'Daniel Reliquias', curso: 'Inglês' },
  { nome: 'Eliza Cristina', curso: 'Inglês' },
  { nome: 'Heloysa Dutra', curso: 'Inglês' },
  { nome: 'Isabela Furlani', curso: 'Inglês' },
  { nome: 'João Gabriel Wortmeyer', curso: 'Inglês' },
  { nome: 'Milena Bender', curso: 'Inglês' },
  { nome: 'Filipe Ramos de Andrade', curso: 'Mecânica de Motos' },
  { nome: 'Jacques Amaral', curso: 'Mecânica de Motos' },
  { nome: 'Marcio Roberto Klinkoski', curso: 'Mecânica de Motos' },
  { nome: 'Paulo Cesar', curso: 'Mecânica de Motos' },
  { nome: 'Jefferson Matheus Grassmann', curso: 'Mecânica de Carros' },
  { nome: 'João Aparecido', curso: 'Mecânica de Carros' },
  { nome: 'Pablo Ramon Sagaz', curso: 'Mecânica de Carros' },
  { nome: 'Richael Dahmer', curso: 'Mecânica de Carros' },
  { nome: 'Otavio Luis', curso: 'Mecânica de Carros' },
  { nome: 'Claudemir Conceição', curso: 'Elétrica Residencial' },
  { nome: 'Mikaelly de Cassia', curso: 'Administração / Secretariado' },
  { nome: 'Thamiris Dubena', curso: 'Administração / Secretariado' },
  { nome: 'Adilson Ferreira', curso: 'Solda' },
  { nome: 'Adrian Patrik', curso: 'Solda' },
  { nome: 'Alberto Batista', curso: 'Solda' },
  { nome: 'Alex Senem', curso: 'Solda' },
  { nome: 'Alexander Campos Cavalcante', curso: 'Solda' },
  { nome: 'Andre Luiz', curso: 'Solda' },
  { nome: 'Angela', curso: 'Solda' },
  { nome: 'Antony Willamis', curso: 'Solda' },
  { nome: 'Carlos Eduardo', curso: 'Solda' },
  { nome: 'Celio Rodrigues', curso: 'Solda' },
  { nome: 'Cristian Silva do Nascimento', curso: 'Solda' },
  { nome: 'Daniel Vieira', curso: 'Solda' },
  { nome: 'Danilo Cruz', curso: 'Solda' },
  { nome: 'Denverson Nataniel', curso: 'Solda' },
  { nome: 'Diones André', curso: 'Solda' },
  { nome: 'Djonatha Schimanski', curso: 'Solda' },
  { nome: 'Edgar Vicente', curso: 'Solda' },
  { nome: 'Elias de Paula Barbosa', curso: 'Solda' },
  { nome: 'Felipe Quadra', curso: 'Solda' },
  { nome: 'Fernando Senem', curso: 'Solda' },
  { nome: 'Gabriel Gouvea', curso: 'Solda' },
  { nome: 'Gabriel Mackievicz', curso: 'Solda' },
  { nome: 'Gabriel Moraes', curso: 'Solda' },
  { nome: 'Gabriel de Cristo', curso: 'Solda' },
  { nome: 'Geovane Matheus', curso: 'Solda' },
  { nome: 'Giliarde José Lopes', curso: 'Solda' },
  { nome: 'Henrique Flor', curso: 'Solda' },
  { nome: 'Henrique de Oliveira Feliciano', curso: 'Solda' },
  { nome: 'Iasmin Gentile', curso: 'Solda' },
  { nome: 'Jonathan Henrique', curso: 'Solda' },
  { nome: 'Jorge Luis', curso: 'Solda' },
  { nome: 'José Manoel', curso: 'Solda' },
  { nome: 'José Rossoni', curso: 'Solda' },
  { nome: 'João Henrique', curso: 'Solda' },
  { nome: 'João Maria', curso: 'Solda' },
  { nome: 'João Pinto', curso: 'Solda' },
  { nome: 'João Victor Holderried', curso: 'Solda' },
  { nome: 'João Victor Milbratz', curso: 'Solda' },
  { nome: 'João Vitor Ramos', curso: 'Solda' },
  { nome: 'Juliano Reiguel', curso: 'Solda' },
  { nome: 'Kassiano Campos', curso: 'Solda' },
  { nome: 'Kauan Richter', curso: 'Solda' },
  { nome: 'Kelvin Lopes', curso: 'Solda' },
  { nome: 'Laurany littman', curso: 'Solda' },
  { nome: 'Laura Emanuele', curso: 'Solda' },
  { nome: 'Leonardo Thilles', curso: 'Solda' },
  { nome: 'Lucas Gabriel', curso: 'Solda' },
  { nome: 'Lucas Reiniak', curso: 'Solda' },
  { nome: 'Luis Henrique', curso: 'Solda' },
  { nome: 'Luiz Phelipe', curso: 'Solda' },
  { nome: 'Matheus Vinicius Moreira', curso: 'Solda' },
  { nome: 'Matheus de Brum', curso: 'Solda' },
  { nome: 'Maylon Velasque', curso: 'Solda' },
  { nome: 'Nickison Borges', curso: 'Solda' },
  { nome: 'Nicolas Eduardo Lindemann', curso: 'Solda' },
  { nome: 'Nikolas Matheus', curso: 'Solda' },
  { nome: 'Nilza', curso: 'Solda' },
  { nome: 'Ramon Estiven', curso: 'Solda' },
  { nome: 'Renan Bueno', curso: 'Solda' },
  { nome: 'Ricardo Alves Bispo', curso: 'Solda' },
  { nome: 'Rodrileico Jose', curso: 'Solda' },
  { nome: 'Samara Baltazar', curso: 'Solda' },
  { nome: 'Simon Ramon', curso: 'Solda' },
  { nome: 'Thiago de Oliveira', curso: 'Solda' },
  { nome: 'Tulho Costa', curso: 'Solda' },
  { nome: 'Uendson Santana', curso: 'Solda' },
  { nome: 'Victor Pietro', curso: 'Solda' },
  { nome: 'Wellison', curso: 'Solda' },
  { nome: 'Wendell', curso: 'Solda' },
  { nome: 'Weric Cardoso', curso: 'Solda' },
  { nome: 'Yenifer Fajardo', curso: 'Solda' },
]

async function main() {
  const turmas = await prisma.turma.findMany()

  const turmasPorCurso: Record<string, typeof turmas> = {}
  for (const turma of turmas) {
    if (!turmasPorCurso[turma.curso]) turmasPorCurso[turma.curso] = []
    turmasPorCurso[turma.curso].push(turma)
  }

  let criados = 0
  let pulados = 0

  for (const alunoData of alunosData) {
    const turmasCurso = turmasPorCurso[alunoData.curso] || []
    const turmaAleatoria = turmasCurso[Math.floor(Math.random() * turmasCurso.length)]

    if (!turmaAleatoria) {
      console.warn(`⚠️  Nenhuma turma para curso: "${alunoData.curso}" — pulando ${alunoData.nome}`)
      pulados++
      continue
    }

    // CPF único baseado no nome para evitar conflito de unique constraint
    const cpfFake = `SEM_CPF_${alunoData.nome.replace(/\s+/g, '_').toUpperCase().slice(0, 20)}`

    await prisma.aluno.create({
      data: {
        nome: alunoData.nome,
        cpf: cpfFake,
        email: null,
        telefone: null,
        foto: null,
        dataNascimento: null,
        dataMatricula: new Date(),
        situacaoMatricula: 'ATIVO',
        turmaId: turmaAleatoria.id,
      },
    })

    criados++
  }

  console.log(`✅ ${criados} alunos cadastrados`)
  if (pulados > 0) console.log(`⚠️  ${pulados} alunos pulados (turma não encontrada)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
