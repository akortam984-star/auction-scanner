import Link from 'next/link'
import { POPULAR_MAKES } from '@/types/auction'

export default function HomePage() {
  const stats = [
    { label: 'Live Listings', value: '500,000+' },
    { label: 'Auction Sources', value: '2' },
    { label: 'States Covered', value: '50' },
    { label: 'Updated Every', value: '5 min' },
  ]

  const features = [
    {
      icon: '⚡',
      title: 'Unified Search',
      desc: 'Search Copart and IAAI simultaneously. Stop toggling between tabs.',
    },
    {
      icon: '🎯',
      title: 'Smart Filters',
      desc: 'Filter by damage type, title status, keys, mileage, and 10+ more criteria.',
    },
    {
      icon: '🔗',
      title: 'Direct Links',
      desc: 'Every listing links directly to the source auction for instant bidding.',
    },
    {
      icon: '📍',
      title: 'Location-Based',
      desc: 'Filter by state to find cars within your transport range.',
    },
    {
      icon: '🛡️',
      title: 'Public Data Only',
      desc: 'We only index publicly available listings. No login required to browse.',
    },
    {
      icon: '💾',
      title: 'Cache & Speed',
      desc: 'Results are cached for speed. Millions of cars, zero lag.',
    },
  ]

  const quickSearches = [
    { label: 'Front End Damage', params: 'primary_damage=Front+End&title_type=Salvage' },
    { label: 'Hail Damage Only', params: 'primary_damage=Hail' },
    { label: 'Keys Present', params: 'keys=Yes&title_type=Salvage' },
    { label: 'Toyota Salvage', params: 'make=Toyota&title_type=Salvage' },
    { label: 'Ford Trucks', params: 'make=Ford&body_style=Pickup' },
    { label: 'Low Mileage', params: 'odometer_max=30000' },
    { label: 'Honda Accord', params: 'make=Honda&model=Accord' },
    { label: 'Texas Lots', params: 'location_state=TX' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#1e2d45]/60 bg-[#050c18]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-sm font-bold">
              AS
            </div>
            <span className="font-display font-700 text-lg tracking-tight text-white">
              Auction<span className="text-brand-400">Scanner</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-sm text-slate-400 hover:text-white transition-colors">
              Search
            </Link>
            <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
              About
            </Link>
            <Link
              href="/search"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Start Searching →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-600/30 bg-brand-950/50 text-brand-300 text-xs font-medium mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
            Live data from Copart & IAAI
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-800 text-white leading-[1.05] tracking-tight mb-6 animate-fade-up stagger-1">
            One search.<br />
            <span className="text-brand-400 glow-text">Every auction.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up stagger-2">
            Stop switching between Copart and IAAI. Search hundreds of thousands of
            salvage listings simultaneously — with the filters that actually matter to dealers.
          </p>

          {/* Hero search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8 animate-fade-up stagger-3">
            <form
              action="/search"
              method="GET"
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <select
                name="make"
                className="flex-1 px-4 py-3.5 rounded-xl border border-[#1e2d45] bg-[#0f172a]/80 text-white text-sm focus:border-brand-500 focus:outline-none transition-colors"
              >
                {POPULAR_MAKES.map(m => (
                  <option key={m} value={m === 'Any Make' ? '' : m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="model"
                placeholder="Model (optional)"
                className="flex-1 px-4 py-3.5 rounded-xl border border-[#1e2d45] bg-[#0f172a]/80 text-white text-sm placeholder:text-slate-500 focus:border-brand-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-xl transition-colors whitespace-nowrap"
              >
                Search All Auctions
              </button>
            </form>
          </div>

          {/* Quick searches */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-up stagger-4">
            <span className="text-slate-500 text-xs pt-1">Quick:</span>
            {quickSearches.map((q) => (
              <Link
                key={q.label}
                href={`/search?${q.params}`}
                className="px-3 py-1.5 rounded-full border border-[#1e2d45] bg-[#0f172a]/40 text-slate-400 hover:text-brand-300 hover:border-brand-600/40 text-xs transition-all"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#1e2d45]/60 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-700 text-brand-400 mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-700 text-white mb-4">
              Built for dealers who move fast
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every feature was designed around how professional rebuilders actually work.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card rounded-2xl p-6 card-hover">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-display font-600 text-white text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center card rounded-3xl p-12 glow-blue">
          <h2 className="font-display text-3xl md:text-4xl font-700 text-white mb-4">
            Ready to find your next buy?
          </h2>
          <p className="text-slate-400 mb-8">
            Search the full Copart and IAAI inventory right now — no account needed.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-colors text-lg"
          >
            Open Search →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1e2d45]/60 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-xs font-bold">AS</div>
            <span className="text-sm text-slate-500">AuctionScanner</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            AuctionScanner indexes publicly available data from Copart and IAAI. 
            We are not affiliated with or endorsed by either company. 
            All trademarks are property of their respective owners.
          </p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link href="/about" className="hover:text-slate-400 transition-colors">About</Link>
            <Link href="/search" className="hover:text-slate-400 transition-colors">Search</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
