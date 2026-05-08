import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ServiceWorkerRegister } from '@/components/shared/service-worker-register'
import { cn } from '@/lib/utils'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERP Futura',
  description: 'Sistema de Gestão Escolar',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Futura',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1e293b" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
            <ServiceWorkerRegister />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
