import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AuctionScanner — Salvage Car Search Across Copart & IAAI',
  description: 'Search and compare salvage vehicle listings from Copart and IAAI auctions in one place. Filter by damage, price, make, model, and more.',
  keywords: 'salvage cars, copart, iaai, auto auction, rebuilt title, car search',
  openGraph: {
    title: 'AuctionScanner',
    description: 'Unified salvage auction search — Copart + IAAI in one place',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen grid-bg">
        {children}
      </body>
    </html>
  )
}
