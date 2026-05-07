'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, DollarSign, Settings, GraduationCap,
  CalendarCheck, FileText, Package, Cake, UserCog, ClipboardList,
  Receipt, UserCheck, MessageSquare,
} from 'lucide-react'
import { UserRole } from '@prisma/client'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/financeiro/mensalidades', label: 'Mensalidades', icon: CalendarCheck },
  { href: '/despesas', label: 'Despesas', icon: Receipt },
  { href: '/chamada', label: 'Chamada', icon: UserCheck },
  { href: '/nota-fiscal', label: 'Nota Fiscal', icon: FileText },
  { href: '/material', label: 'Material', icon: Package },
  { href: '/aniversarios', label: 'Aniversários', icon: Cake },
  { href: '/comunicados', label: 'Comunicados', icon: MessageSquare },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const adminNavItems = [
  { href: '/configuracoes/usuarios', label: 'Usuários', icon: UserCog },
  { href: '/configuracoes/auditoria', label: 'Auditoria', icon: ClipboardList },
]

interface SidebarProps {
  userRole?: UserRole
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = userRole === 'ADMIN'
  const allItems = isAdmin ? [...navItems, ...adminNavItems] : navItems

  return (
    <aside className="w-64 bg-[#1e3a5f] dark:bg-[#0f172a] text-white flex flex-col min-h-screen fixed left-0 top-0 z-10 no-print" data-sidebar>
      <div className="p-6 border-b border-blue-800 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-blue-300" />
          <div>
            <h1 className="font-bold text-lg leading-tight">ERP Escolar</h1>
            <p className="text-blue-300 text-xs">Sistema de Gestão</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {allItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-blue-800 dark:border-slate-700">
        <p className="text-blue-400 text-xs text-center">v1.1.0</p>
      </div>
    </aside>
  )
}
