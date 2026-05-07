'use client'
import { useEffect, useState } from 'react'
import { Users, LogOut, Shield, Search } from 'lucide-react'
import { UserRole } from '@prisma/client'
import { signOut } from '@/app/(auth)/login/actions'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { NotificationBell } from '@/components/shared/notification-bell'
import { Button } from '@/components/ui/button'

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  SECRETARIA: 'Secretaria',
  FINANCEIRO: 'Financeiro',
  PROFESSOR: 'Professor',
  VISUALIZADOR: 'Visualizador',
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  SECRETARIA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  FINANCEIRO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PROFESSOR: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  VISUALIZADOR: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

interface HeaderProps {
  userName: string
  userRole: UserRole
}

export default function Header({ userName, userRole }: HeaderProps) {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setTotal(d.totalAlunos))
      .catch(() => {})
  }, [])

  function openPalette() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
  }

  return (
    <header className="bg-background border-b border-border px-6 py-3 flex items-center justify-between no-print">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">ERP Escolar</h2>
        {total !== null && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{total} alunos</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={openPalette}
          className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm h-8 px-3"
        >
          <Search className="h-3.5 w-3.5" />
          Buscar...
          <kbd className="ml-1 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            ⌘K
          </kbd>
        </Button>

        <NotificationBell />
        <ThemeToggle />

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">{userName}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[userRole]}`}>
            {ROLE_LABELS[userRole]}
          </span>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  )
}
