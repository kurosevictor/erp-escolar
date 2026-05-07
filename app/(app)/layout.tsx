import { requireAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { CommandPalette } from '@/components/shared/command-palette'
import { KeyboardHelpDialog } from '@/components/shared/keyboard-help-dialog'
import { AppShortcuts } from '@/components/shared/app-shortcuts'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()

  return (
    <>
      <Sidebar userRole={user.role} />
      <div className="ml-64">
        <Header userName={user.nome} userRole={user.role} />
        <main className="p-6 min-h-screen bg-background">{children}</main>
      </div>
      <CommandPalette />
      <KeyboardHelpDialog />
      <AppShortcuts />
    </>
  )
}
