import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Settings, Users, FileSpreadsheet, ClipboardList, School } from 'lucide-react'

const tabs = [
  { href: '/configuracoes/escola', label: 'Escola', icon: School, adminOnly: true },
  { href: '/configuracoes/usuarios', label: 'Usuários', icon: Users, adminOnly: true },
  { href: '/configuracoes/sheets', label: 'Google Sheets', icon: FileSpreadsheet, adminOnly: false },
  { href: '/configuracoes/auditoria', label: 'Auditoria', icon: ClipboardList, adminOnly: true },
]

export default async function ConfiguracoesPage() {
  const user = await requireAuth()
  const isAdmin = user.role === 'ADMIN'

  const items = tabs.filter(t => !t.adminOnly || isAdmin)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-card border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm hover:border-primary/30 transition-all"
            >
              <div className="bg-muted p-3 rounded-lg">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{item.label}</p>
                {item.adminOnly && <p className="text-xs text-muted-foreground">Apenas Admin</p>}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
