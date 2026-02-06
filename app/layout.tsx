import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wallet Dashboard',
  description: 'Crypto wallet dashboard with deposit/withdraw functionality',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ backgroundColor: '#FFFFFF' }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: '#FFFFFF' }}>{children}</body>
    </html>
  )
}
