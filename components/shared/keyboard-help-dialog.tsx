'use client'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const shortcuts = [
  { key: '⌘K', label: 'Abrir busca' },
  { key: 'A', label: 'Alunos' },
  { key: 'F', label: 'Financeiro' },
  { key: 'M', label: 'Mensalidades' },
  { key: 'C', label: 'Chamada' },
  { key: 'N', label: 'Novo aluno' },
  { key: '?', label: 'Atalhos de teclado' },
]

export function KeyboardHelpDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.key === '?') { e.preventDefault(); setOpen((v) => !v) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold flex items-center justify-center hover:bg-accent shadow-sm no-print"
        title="Atalhos de teclado (?)"
      >
        ?
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atalhos de Teclado</DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-4 py-1">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono font-semibold">{s.key}</kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
