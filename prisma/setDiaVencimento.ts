import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Mapeamento: nome exato no banco → diaVencimento
const mapa: Record<string, number> = {
  'Kauanny Maia': 10,
  'Kaue Maia': 10,
  'Shadi Yared': 8,
  'Juracir Silva Matos': 8,
  'Eduardo Lopes': 10,
  'Vanessa Fátima': 6,
  'João Victor Holderried': 10,
  'Juliano Reiguel': 8,
  'Matheus Vinicius Moreira': 8,
  'Bruna Pickler': 10,
  'Isabela Furlani': 15,
  'Iasmin Gentile': 7,
  'Daniel Reliquias': 10,
  'Uendson Santana': 15,
  'Henrique Flor': 8,
  'Diones André': 8,
  'Marcio Roberto Klinkoski': 8,
  'Beatriz Krueger': 15,
  'Lucas Reiniak': 10,
  'Cristian Silva do Nascimento': 7,
  'José Augusto Rossoni': 7,
  'Djonatha Schimanski': 7,
  'Laura Emanuele': 8,
  'Weric Cardoso': 8,
  'Adilson Ferreira': 10,
  'Ramon Estiven': 8,
  'Denverson Nataniel': 8,
  'Nicolas Eduardo Lindemann': 10,
  'Lucas Gabriel': 7,
  'João Victor Milbratz': 8,
  'Jorge Luis': 7,
  'Alberto Batista Filho': 10,
  'João Gabriel Wortmeyer': 10,
  'Laurany littman': 10,
  'Gabriel Moraes': 8,
  'Celio Rodrigues': 8,
  'Danilo Cruz': 10,
  'Kassiano Campos': 8,
  'Adrian Patrik': 8,
  'Thiago de Oliveira': 8,
  'Kauan Richter': 10,
  'Pablo Ramon Sagaz': 10,
  'Rodrileico Jose': 7,
  'Luis Henrique': 8,
  'Thamiris Dubena': 10,
  'João Henrique': 7,
  'Felipe Quadra': 10,
  'Nickison Borges': 8,
  'Luiz Phelipe': 10,
  'Mikaelly de Cassia': 10,
  'Wellison': 8,
  'Milena Bender': 10,
  'Leonardo Thilles': 8,
  'Otavio Luis': 10,
  'Gabriel Gouvea': 15,
  'Yenifer Fajardo': 10,
  'João Pinto': 7,
  'Alex Senem': 10,
  'Fernando Senem': 10,
  'João Maria Leffel': 8,
  'Claudemir Conceição': 10,
  'Renan Bueno': 15,
  'Everton Bruno': 10,
  'Kauê Felipe': 10,
  'Eliza Cristina': 15,
  'Andre Luiz': 8,
  'José Manoel': 10,
  'Carlos Eduardo': 22,
  'Geovane Matheus': 8,
  'Gabriel de Cristo': 15,
  'Heloysa Dutra': 8,
  'Richael Dahmer': 8,
  'Bernardo Junkes': 8,
  'Nikolas Matheus': 8,
  'Wendell': 8,
  'Ricardo Alves Bispo': 10,
  'Nilza': 8,
  'Maylon Velasque': 8,
  'Paulo Cesar': 15,
  'Gabriel Mackievicz': 8,
  'Antony Willamis': 8,
  'Jonathan Henrique': 8,
  'Giliarde José Lopes': 8,
  'Simon Ramon': 8,
  'João Aparecido': 10,
  'Jacques Amaral': 8,
  'Tulho Costa': 8,
  'Daniel Vieira': 8,
  'Matheus de Brum': 8,
  'Elias de Paula Barbosa': 8,
  'Edgar Vicente': 8,
  'Kelvin Lopes': 10,
  'Alexander Campos Cavalcante': 11,
  'Henrique de Oliveira Feliciano': 8,
  'Filipe Ramos de Andrade': 8,
  'Jefferson Matheus Grassmann': 8,
  'Thiago Aramis Balsanelli': 10,
  'Nicolas Gabriel Doge': 8,
  'Daniel Ferreira da Venda Filho': 8,
  'Isabela Honorato Roso': 8,
  'João Vitor dos Santos': 8,
}

async function main() {
  let atualizados = 0
  let naoEncontrados: string[] = []

  for (const [nome, dia] of Object.entries(mapa)) {
    const result = await prisma.aluno.updateMany({
      where: { nome },
      data: { diaVencimento: dia },
    })
    if (result.count > 0) {
      atualizados++
    } else {
      naoEncontrados.push(nome)
    }
  }

  // Cadastrar Junior Bueno
  await prisma.aluno.create({
    data: {
      nome: 'Junior Bueno',
      cpf: 'PENDENTE-JUNIOR-BUENO',
      dataMatricula: new Date(),
      situacaoMatricula: 'ATIVO',
      diaVencimento: 10,
      turmaId: 'cmoss4d200000nsbmknwi5ozc', // Solda - Turma 1 (Quarta 18h)
    },
  })
  console.log('✅ Junior Bueno cadastrado (CPF pendente)')

  console.log(`✅ ${atualizados} alunos atualizados`)
  if (naoEncontrados.length > 0) {
    console.log('⚠️  Não encontrados no banco:', naoEncontrados)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
