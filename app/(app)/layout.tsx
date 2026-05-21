import { requireAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { CommandPalette } from '@/components/shared/command-palette'
import { KeyboardHelpDialog } from '@/components/shared/keyboard-help-dialog'
import { AppShortcuts } from '@/components/shared/app-shortcuts'
import { ChatAssistant } from '@/components/shared/chat-assistant'
import { PwaInstallBanner } from '@/components/shared/pwa-install-banner'
import { ReadonlyWrapper } from '@/components/shared/readonly-wrapper'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  const chatEnabled = !!process.env.ANTHROPIC_API_KEY

  return (
    <>
      <Sidebar userRole={user.role} />
      <div className="ml-64">
        <Header userName={user.nome} userRole={user.role} />
        <main className="p-6 min-h-screen bg-background">
          <ReadonlyWrapper isReadOnly={user.role === 'VISUALIZADOR'}>
            {children}
          </ReadonlyWrapper>
        </main>
      </div>
      <CommandPalette />
      <KeyboardHelpDialog />
      <AppShortcuts />
      <ChatAssistant enabled={chatEnabled} />
      <PwaInstallBanner />
    </>
  )
}
