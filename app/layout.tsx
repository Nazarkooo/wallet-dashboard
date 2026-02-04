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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
