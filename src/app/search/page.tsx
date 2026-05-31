import { Suspense } from 'react'
import Link from 'next/link'
import SearchPageClient from '@/components/SearchPageClient'

export const metadata = {
  title: 'Search Salvage Auctions — AuctionScanner',
  description: 'Filter and search Copart and IAAI listings by make, model, damage, title type, and more.',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#1e2d45]/60 bg-[#050c18]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center text-xs font-bold">AS</div>
            <span className="font-display font-700 text-base text-white">
              Auction<span className="text-brand-400">Scanner</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">Copart + IAAI</span>
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">← Home</Link>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-slate-500">Loading search...</div>}>
        <SearchPageClient />
      </Suspense>
    </div>
  )
}
