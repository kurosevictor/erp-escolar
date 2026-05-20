'use client'
import { usePathname } from 'next/navigation'
import { EyeIcon } from 'lucide-react'

export function ReadonlyWrapper({ isReadOnly, children }: { isReadOnly: boolean; children: React.ReactNode }) {
  const pathname = usePathname()

  if (!isReadOnly || pathname.startsWith('/gerador-contrato')) {
    return <>{children}</>
  }

  return (
    <div data-readonly="true">
      <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
        <EyeIcon className="w-4 h-4 shrink-0" />
        <span>
          <strong>Modo Visualização</strong> — você pode ver tudo, mas não pode fazer alterações.
          Para gerar contratos, acesse a aba <strong>Gerador de Contrato</strong>.
        </span>
      </div>
      {children}
    </div>
  )
}
