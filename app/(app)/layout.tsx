import { requireAuth } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()

  return (
    <>
      <Sidebar userRole={user.role} />
      <div className="ml-64">
        <Header userName={user.nome} userRole={user.role} />
        <main className="p-6 min-h-screen">{children}</main>
      </div>
    </>
  )
}
