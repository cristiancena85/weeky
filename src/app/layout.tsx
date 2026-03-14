import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { RealtimeProvider } from '@/contexts/RealtimeContext'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Weeky',
  description: 'Aplicación semanal con Next.js y Supabase',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RealtimeProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
