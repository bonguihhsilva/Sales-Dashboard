import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GDS - Frame · Dashboard',
  description: 'Painel de vendas e metas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
