import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GRND',
  description: "Gurpreet's fitness app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}