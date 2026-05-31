import { scrapeCopart } from './copart'
import { scrapeIAAI } from './iaai'
import { AuctionListing, SearchFilters, SearchResult } from '@/types/auction'
import { supabaseServer } from '@/lib/supabase'

const CACHE_TTL_MINUTES = 10

async function getCachedResults(cacheKey: string): Promise<AuctionListing[] | null> {
  try {
    const { data } = await supabaseServer
      .from('listing_cache')
      .select('listings, cached_at')
      .eq('cache_key', cacheKey)
      .single()

    if (!data) return null

    const cachedAt = new Date(data.cached_at)
    const ageMinutes = (Date.now() - cachedAt.getTime()) / 1000 / 60

    if (ageMinutes > CACHE_TTL_MINUTES) return null

    return data.listings as AuctionListing[]
  } catch {
    return null
  }
}

async function setCachedResults(
  cacheKey: string,
  listings: AuctionListing[],
  total: number
): Promise<void> {
  try {
    await supabaseServer.from('listing_cache').upsert({
      cache_key: cacheKey,
      listings,
      total,
      cached_at: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('[Cache set error]', err)
  }
}

function buildCacheKey(filters: SearchFilters): string {
  const parts = [
    filters.source || 'all',
    filters.make || '',
    filters.model || '',
    filters.year_min || '',
    filters.year_max || '',
    filters.primary_damage || '',
    filters.title_type || '',
    filters.location_state || '',
    filters.body_style || '',
    filters.fuel_type || '',
    filters.keys || '',
    filters.sort_by || 'sale_date',
    filters.page || 1,
    filters.per_page || 25,
  ]
  return parts.join(':')
}

export async function searchListings(filters: SearchFilters): Promise<SearchResult> {
  const page = filters.page || 1
  const perPage = filters.per_page || 25
  const source = filters.source || 'all'

  const cacheKey = buildCacheKey(filters)
  
  // Try cache first
  const cached = await getCachedResults(cacheKey)
  if (cached) {
    return {
      listings: cached,
      total: cached.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(cached.length / perPage),
      sources: {
        copart: cached.filter(l => l.source === 'copart').length,
        iaai: cached.filter(l => l.source === 'iaai').length,
      },
    }
  }

  // Parallel fetch from both sources
  const results = await Promise.allSettled([
    source !== 'iaai' ? scrapeCopart(filters) : Promise.resolve({ listings: [], total: 0 }),
    source !== 'copart' ? scrapeIAAI(filters) : Promise.resolve({ listings: [], total: 0 }),
  ])

  const copartResult = results[0].status === 'fulfilled' ? results[0].value : { listings: [], total: 0 }
  const iaaiResult = results[1].status === 'fulfilled' ? results[1].value : { listings: [], total: 0 }

  // Merge and sort
  let combined = [...copartResult.listings, ...iaaiResult.listings]

  // Apply price filters client-side (both sources)
  if (filters.price_min) {
    combined = combined.filter(l => (l.current_bid || 0) >= filters.price_min!)
  }
  if (filters.price_max) {
    combined = combined.filter(l => (l.current_bid || 0) <= filters.price_max!)
  }
  if (filters.odometer_max) {
    combined = combined.filter(l => !l.odometer || l.odometer <= filters.odometer_max!)
  }

  // Sort merged results
  switch (filters.sort_by) {
    case 'price_asc':
      combined.sort((a, b) => (a.current_bid || 0) - (b.current_bid || 0))
      break
    case 'price_desc':
      combined.sort((a, b) => (b.current_bid || 0) - (a.current_bid || 0))
      break
    case 'year_desc':
      combined.sort((a, b) => (b.year || 0) - (a.year || 0))
      break
    case 'odometer_asc':
      combined.sort((a, b) => (a.odometer || 999999) - (b.odometer || 999999))
      break
    default:
      // Sale date
      combined.sort((a, b) => {
        if (!a.sale_date) return 1
        if (!b.sale_date) return -1
        return new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
      })
  }

  const total = copartResult.total + iaaiResult.total

  // Cache results
  await setCachedResults(cacheKey, combined, total)

  return {
    listings: combined,
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
    sources: {
      copart: copartResult.total,
      iaai: iaaiResult.total,
    },
  }
}
