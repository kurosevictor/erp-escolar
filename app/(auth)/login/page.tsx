'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GraduationCap, Loader2 } from 'lucide-react'
import { signIn } from './actions'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const [state, action, pending] = useActionState(signIn, null)

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#1e3a5f] rounded-full p-3 mb-4">
            <GraduationCap className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Escolar</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gestão Escolar</p>
        </div>

        <form action={action} className="space-y-5">
          <input type="hidden" name="redirect" value={redirectTo} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-pulse h-96" />}>
      <LoginForm />
    </Suspense>
  )
}
