'use server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || '/'

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou senha incorretos' }
  }

  await prisma.user.updateMany({
    where: { supabaseId: data.user.id },
    data: { lastLoginAt: new Date() },
  })

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
