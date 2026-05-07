'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const shortcuts: Record<string, string> = {
        a: '/alunos',
        f: '/financeiro',
        m: '/financeiro/mensalidades',
        c: '/chamada',
        n: '/alunos/novo',
      }

      if (shortcuts[e.key]) {
        e.preventDefault()
        router.push(shortcuts[e.key])
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])
}
