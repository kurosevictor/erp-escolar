'use client'
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
}

export function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa-dismissed')) {
      setDismissed(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setPrompt(null)
    }
  }

  function dismiss() {
    localStorage.setItem('pwa-dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-20 sm:w-80 bg-card border rounded-lg shadow-lg p-4 z-40 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium">Instalar app</p>
        <p className="text-xs text-muted-foreground">Adicione à tela inicial para acesso rápido</p>
      </div>
      <button
        onClick={install}
        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0"
      >
        <Download className="w-3.5 h-3.5" /> Instalar
      </button>
      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
