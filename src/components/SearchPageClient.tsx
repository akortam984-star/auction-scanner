'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchFilters, SearchResult, AuctionListing, DAMAGE_TYPES, TITLE_TYPES, BODY_STYLES, FUEL_TYPES, US_STATES, POPULAR_MAKES } from '@/types/auction'
import ListingCard from './ListingCard'
import FilterPanel from './FilterPanel'

export default function SearchPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const getFiltersFromUrl = useCallback((): SearchFilters => ({
    source: (searchParams.get('source') as SearchFilters['source']) || 'all',
    make: searchParams.get('make') || undefined,
    model: searchParams.get('model') || undefined,
    year_min: searchParams.get('year_min') ? Number(searchParams.get('year_min')) : undefined,
    year_max: searchParams.get('year_max') ? Number(searchParams.get('year_max')) : undefined,
    price_min: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined,
    price_max: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined,
    odometer_max: searchParams.get('odometer_max') ? Number(searchParams.get('odometer_max')) : undefined,
    primary_damage: searchParams.get('primary_damage') || undefined,
    title_type: searchParams.get('title_type') || undefined,
    keys: searchParams.get('keys') || undefined,
    fuel_type: searchParams.get('fuel_type') || undefined,
    body_style: searchParams.get('body_style') || undefined,
    location_state: searchParams.get('location_state') || undefined,
    sort_by: (searchParams.get('sort_by') as SearchFilters['sort_by']) || 'sale_date',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  }), [searchParams])

  const fetchResults = useCallback(async (filters: SearchFilters) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
    })

    try {
      const res = await fetch(`/api/search?${params.toString()}`, {
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`Search failed: ${res.status}`)
      const data: SearchResult = await res.json()
      setResults(data)
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError('Search failed. The auction sites may be temporarily unavailable.')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch when URL params change
  useEffect(() => {
    const filters = getFiltersFromUrl()
    fetchResults(filters)
  }, [searchParams, fetchResults, getFiltersFromUrl])

  const applyFilters = (newFilters: SearchFilters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') params.set(k, String(v))
    })
    params.set('page', '1')
    router.push(`/search?${params.toString()}`)
    setFiltersOpen(false)
  }

  const currentFilters = getFiltersFromUrl()
  const activeFilterCount = [
    currentFilters.make,
    currentFilters.model,
    currentFilters.year_min || currentFilters.year_max,
    currentFilters.price_min || currentFilters.price_max,
    currentFilters.primary_damage,
    currentFilters.title_type,
    currentFilters.keys,
    currentFilters.fuel_type,
    currentFilters.body_style,
    currentFilters.location_state,
    currentFilters.odometer_max,
  ].filter(Boolean).length

  return (
    <div className="flex flex-1 relative">
      {/* FILTER PANEL - mobile overlay / desktop sidebar */}
      <div className={`
        fixed inset-0 z-40 md:relative md:inset-auto md:z-auto
        ${filtersOpen ? 'flex' : 'hidden md:flex'}
      `}>
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60 md:hidden"
          onClick={() => setFiltersOpen(false)}
        />
        {/* Panel */}
        <div className="relative z-10 w-80 bg-[#050c18] border-r border-[#1e2d45]/60 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-[#1e2d45]/60 flex items-center justify-between md:hidden">
            <span className="font-medium text-white">Filters</span>
            <button onClick={() => setFiltersOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <FilterPanel
            filters={currentFilters}
            onApply={applyFilters}
          />
        </div>
      </div>

      {/* RESULTS */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Results header */}
        <div className="sticky top-14 z-30 border-b border-[#1e2d45]/60 bg-[#050c18]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1e2d45] text-sm text-slate-300 hover:border-brand-600/40"
            >
              ⚙ Filters {activeFilterCount > 0 && <span className="bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>}
            </button>
            <div className="text-sm text-slate-400">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  Searching auctions...
                </span>
              ) : results ? (
                <span>
                  <span className="text-white font-medium">{results.total.toLocaleString()}</span> total —{' '}
                  <span className="text-green-400">{results.sources.copart.toLocaleString()} Copart</span>{' / '}
                  <span className="text-brand-400">{results.sources.iaai.toLocaleString()} IAAI</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Sort */}
          <select
            value={currentFilters.sort_by || 'sale_date'}
            onChange={(e) => applyFilters({ ...currentFilters, sort_by: e.target.value as SearchFilters['sort_by'] })}
            className="px-3 py-2 text-sm rounded-lg border border-[#1e2d45] bg-[#0f172a] text-slate-300 focus:border-brand-500 focus:outline-none"
          >
            <option value="sale_date">Sale Date ↑</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="year_desc">Year: Newest First</option>
            <option value="odometer_asc">Mileage: Lowest First</option>
          </select>
        </div>

        {/* Source filter tabs */}
        <div className="px-4 pt-4 pb-2 flex gap-2">
          {(['all', 'copart', 'iaai'] as const).map((src) => (
            <button
              key={src}
              onClick={() => applyFilters({ ...currentFilters, source: src })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentFilters.source === src || (!currentFilters.source && src === 'all')
                  ? 'bg-brand-600 text-white'
                  : 'border border-[#1e2d45] text-slate-400 hover:border-brand-600/40 hover:text-white'
              }`}
            >
              {src === 'all' ? 'All Sources' : src === 'copart' ? '🟢 Copart' : '🔵 IAAI'}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div className="flex-1 p-4">
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-800/40 bg-red-950/20 text-red-400 text-sm">
              {error}
              <button
                onClick={() => fetchResults(currentFilters)}
                className="ml-3 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="card rounded-2xl overflow-hidden">
                  <div className="skeleton h-44 w-full" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-5 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results && results.listings.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-white font-medium text-lg mb-2">No listings found</h3>
              <p className="text-slate-400 text-sm">
                Try adjusting your filters or searching a different make/model.
              </p>
            </div>
          )}

          {!loading && results && results.listings.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {results.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {results.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <button
                    disabled={results.page <= 1}
                    onClick={() => applyFilters({ ...currentFilters, page: results.page - 1 })}
                    className="px-4 py-2 rounded-lg border border-[#1e2d45] text-sm text-slate-400 disabled:opacity-30 hover:border-brand-600/40 hover:text-white transition-all"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {results.page} of {results.total_pages}
                  </span>
                  <button
                    disabled={results.page >= results.total_pages}
                    onClick={() => applyFilters({ ...currentFilters, page: results.page + 1 })}
                    className="px-4 py-2 rounded-lg border border-[#1e2d45] text-sm text-slate-400 disabled:opacity-30 hover:border-brand-600/40 hover:text-white transition-all"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
