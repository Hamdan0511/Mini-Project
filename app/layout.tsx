import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EcoEvaluator - 2050',
  description: 'Environmental impact evaluation platform',
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


