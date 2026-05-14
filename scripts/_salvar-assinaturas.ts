import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { prisma } from '../lib/prisma'

async function main() {
  const paolaPng  = fs.readFileSync(path.resolve('C:/Users/Futura/Downloads/assinaturas/assinatura Paola.png'))
  const victorPng = fs.readFileSync(path.resolve('C:/Users/Futura/Downloads/assinaturas/assinatura Victor.png'))

  const paolaB64  = `data:image/png;base64,${paolaPng.toString('base64')}`
  const victorB64 = `data:image/png;base64,${victorPng.toString('base64')}`

  // Upsert Paola
  const paola = await prisma.user.upsert({
    where: { email: 'paola@futura.internal' },
    update: { assinaturaUrl: paolaB64 },
    create: {
      supabaseId: 'sig-paola-00000000-0000-0000-0000-000000000001',
      nome: 'Paola',
      email: 'paola@futura.internal',
      role: 'SECRETARIA',
      ativo: true,
      assinaturaUrl: paolaB64,
    },
  })
  console.log(`✓ Assinatura salva para ${paola.nome}`)

  // Upsert Victor
  const victor = await prisma.user.upsert({
    where: { email: 'victor@futura.internal' },
    update: { assinaturaUrl: victorB64 },
    create: {
      supabaseId: 'sig-victor-00000000-0000-0000-0000-000000000002',
      nome: 'Victor',
      email: 'victor@futura.internal',
      role: 'SECRETARIA',
      ativo: true,
      assinaturaUrl: victorB64,
    },
  })
  console.log(`✓ Assinatura salva para ${victor.nome}`)
}

main().catch(console.error).finally(() => process.exit(0))
