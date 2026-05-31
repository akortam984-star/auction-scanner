// src/components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
          <span className="text-brand-600 text-2xl">⚡</span>
          <span>AuctionScanner</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/search" className="hover:text-brand-600 transition-colors">
            Search Listings
          </Link>
          <Link href="/about" className="hover:text-brand-600 transition-colors">
            How It Works
          </Link>
        </div>

        {/* CTA */}
        <Link href="/search" className="btn-primary hidden sm:inline-flex">
          Start Searching
        </Link>
      </div>
    </nav>
  );
}
