import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Eduardo Lopes: 360 + 359.9 (dois cursos) = 719.9
// Otavio Luis: 240 + 400 (dois cursos) = 640
// Everton Bruno e Kauê Felipe: 289 cada
const mapa: Record<string, number> = {
  'Kauanny Maia': 299.9,
  'Kaue Maia': 299.9,
  'Shadi Yared': 299,
  'Juracir Silva Matos': 240,
  'Eduardo Lopes': 719.9,
  'Vanessa Fátima': 200,
  'João Victor Holderried': 249.9,
  'Juliano Reiguel': 249,
  'Matheus Vinicius Moreira': 289.9,
  'Bruna Pickler': 249.9,
  'Isabela Furlani': 249.9,
  'Iasmin Gentile': 169.9,
  'Daniel Reliquias': 204.9,
  'Uendson Santana': 250,
  'Henrique Flor': 216.9,
  'Diones André': 249.9,
  'Marcio Roberto Klinkoski': 239.9,
  'Beatriz Krueger': 199.9,
  'Lucas Reiniak': 250,
  'Cristian Silva do Nascimento': 239.9,
  'José Augusto Rossoni': 339.9,
  'Djonatha Schimanski': 239.9,
  'Laura Emanuele': 170,
  'Weric Cardoso': 250,
  'Adilson Ferreira': 239.9,
  'Ramon Estiven': 250,
  'Denverson Nataniel': 249.9,
  'Nicolas Eduardo Lindemann': 250,
  'Lucas Gabriel': 249.9,
  'João Victor Milbratz': 240,
  'Jorge Luis': 249.9,
  'Alberto Batista Filho': 240,
  'João Gabriel Wortmeyer': 209.9,
  'Laurany littman': 140,
  'Gabriel Moraes': 250,
  'Celio Rodrigues': 250,
  'Danilo Cruz': 250,
  'Kassiano Campos': 250,
  'Adrian Patrik': 249.9,
  'Thiago de Oliveira': 250,
  'Kauan Richter': 249.9,
  'Pablo Ramon Sagaz': 239.9,
  'Rodrileico Jose': 225,
  'Luis Henrique': 240,
  'Thamiris Dubena': 249.9,
  'João Henrique': 289.9,
  'Felipe Quadra': 209,
  'Nickison Borges': 249.9,
  'Luiz Phelipe': 309.9,
  'Mikaelly de Cassia': 199.99,
  'Wellison': 309,
  'Milena Bender': 249.9,
  'Leonardo Thilles': 380,
  'Otavio Luis': 640,
  'Gabriel Gouvea': 249.9,
  'Yenifer Fajardo': 239,
  'João Pinto': 250,
  'Alex Senem': 250,
  'Fernando Senem': 250,
  'João Maria Leffel': 309,
  'Claudemir Conceição': 239.9,
  'Renan Bueno': 150,
  'Everton Bruno': 289,
  'Kauê Felipe': 289,
  'Eliza Cristina': 350,
  'Andre Luiz': 200,
  'José Manoel': 289.9,
  'Carlos Eduardo': 249.9,
  'Geovane Matheus': 249.9,
  'Gabriel de Cristo': 169,
  'Heloysa Dutra': 299.9,
  'Richael Dahmer': 250,
  'Bernardo Junkes': 169.9,
  'Nikolas Matheus': 250,
  'Wendell': 249.9,
  'Ricardo Alves Bispo': 309,
  'Nilza': 169.9,
  'Maylon Velasque': 250,
  'Paulo Cesar': 249.9,
  'Gabriel Mackievicz': 250,
  'Antony Willamis': 249.9,
  'Jonathan Henrique': 250,
  'Giliarde José Lopes': 249.9,
  'Simon Ramon': 500,
  'João Aparecido': 250,
  'Jacques Amaral': 249.9,
  'Tulho Costa': 309,
  'Daniel Vieira': 309,
  'Matheus de Brum': 250,
  'Elias de Paula Barbosa': 500,
  'Edgar Vicente': 249.9,
  'Kelvin Lopes': 309,
  'Alexander Campos Cavalcante': 559,
  'Henrique de Oliveira Feliciano': 169,
  'Junior Bueno': 434,
  'Filipe Ramos de Andrade': 250,
  'Jefferson Matheus Grassmann': 320.73,
  'Thiago Aramis Balsanelli': 500,
  'Nicolas Gabriel Doge': 299,
  'Daniel Ferreira da Venda Filho': 250,
  'João Vitor dos Santos': 249.9,
}

async function main() {
  let atualizados = 0
  const naoEncontrados: string[] = []

  for (const [nome, valor] of Object.entries(mapa)) {
    const result = await prisma.aluno.updateMany({
      where: { nome },
      data: { valorMensalidade: valor },
    })
    if (result.count > 0) atualizados++
    else naoEncontrados.push(nome)
  }

  console.log(`✅ ${atualizados} alunos atualizados com valorMensalidade`)
  if (naoEncontrados.length > 0)
    console.log('⚠️  Não encontrados:', naoEncontrados)
}

main().catch(console.error).finally(() => prisma.$disconnect())
