import Link from 'next/link'

export const metadata = {
  title: 'About AuctionScanner',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-[#1e2d45]/60 bg-[#050c18]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center text-xs font-bold">AS</div>
            <span className="font-display font-700 text-base text-white">
              Auction<span className="text-brand-400">Scanner</span>
            </span>
          </Link>
          <Link href="/search" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-lg transition-colors">
            Start Searching →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="font-display text-4xl font-700 text-white mb-6">About AuctionScanner</h1>
        
        <div className="space-y-6 text-slate-400 leading-relaxed">
          <p>
            AuctionScanner is a unified search tool for salvage vehicle dealers and rebuilders. 
            Instead of manually searching Copart and IAAI separately, we consolidate publicly 
            available listings into one fast, filterable interface.
          </p>

          <h2 className="font-display text-xl font-600 text-white pt-4">How it works</h2>
          <p>
            Our server fetches publicly available listing data from Copart and IAAI — the same data 
            anyone can see by visiting those sites. We don&apos;t bypass any authentication, store personal data, 
            or reproduce content that isn&apos;t freely accessible. Results are cached briefly to reduce load 
            and serve pages faster.
          </p>
          <p>
            Every listing card links directly to the original vehicle on the auction site, where you 
            can bid, see full details, and complete your purchase through official channels.
          </p>

          <h2 className="font-display text-xl font-600 text-white pt-4">Legal & data policy</h2>
          <p>
            We index only publicly available listings — no login required, no restricted data accessed. 
            Court precedents (hiQ v. LinkedIn, Meta v. Bright Data 2024) affirm that indexing publicly 
            accessible web data does not constitute unauthorized access under US law.
          </p>
          <p>
            AuctionScanner is not affiliated with, endorsed by, or sponsored by Copart or IAA Holdings. 
            All trademarks and listing content remain the property of their respective owners.
          </p>

          <h2 className="font-display text-xl font-600 text-white pt-4">What&apos;s coming</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>AI damage assessment from listing photos</li>
            <li>Repair cost estimator per make/model/damage zone</li>
            <li>Dealer budget profiles — get deals scored against your criteria</li>
            <li>Local rebuilt-title resale value by ZIP code</li>
            <li>Email/SMS alerts for matching listings</li>
          </ul>
        </div>

        <div className="mt-12">
          <Link href="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-colors">
            Start Searching →
          </Link>
        </div>
      </div>
    </div>
  )
}
