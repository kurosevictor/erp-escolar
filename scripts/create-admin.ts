import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createClient } from '@supabase/supabase-js'

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const nome = process.env.ADMIN_NOME || 'Administrador'

  if (!email || !password) {
    console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD antes de rodar este script.')
    process.exit(1)
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error('Erro ao criar usuário no Supabase Auth:', error.message)
    process.exit(1)
  }

  await prisma.user.create({
    data: {
      supabaseId: data.user.id,
      email,
      nome,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Admin criado com sucesso: ${email}`)
  await prisma.$disconnect()
  process.exit(0)
}

main()
