import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERP Escolar',
  description: 'Sistema de Gestão Escolar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50`}>
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="p-6 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
