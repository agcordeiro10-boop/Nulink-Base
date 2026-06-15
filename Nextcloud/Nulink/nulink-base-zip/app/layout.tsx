import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nulink Base | CRM Operacional',
  description: 'Sistema de gestão Nulink - Empresas, Profissionais e Pipeline',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
