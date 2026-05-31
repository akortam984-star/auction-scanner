import type { Listing, SearchFilters, SearchResult } from '@/types/listing'

const BASE_URL = 'https://apibara.tech/api/v1/vehicle-auction'
const API_KEY = process.env.APIBARA_API_KEY!

function apiHeaders() {
  return { 'X-API-Key': API_KEY }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListing(v: any): Listing {
  return {
    id: v.lot_number ?? v.slug_vin,
    source: v.platform === 'copart' ? 'copart' : 'iaai',
    lot_number: v.lot_number ?? '',
    vin: v.vin ?? null,
    year: v.year ?? null,
    make: v.make ?? null,
    model: v.model ?? null,
    trim: v.details?.attributes?.Series ?? null,
    body_style: v.vehicle_specs?.body_style ?? null,
    color: v.vehicle_specs?.exterior_color ?? null,
    odometer: v.odometer?.mi ?? null,
    odometer_unit: 'mi',
    primary_damage: v.condition?.primary_damage ?? null,
    secondary_damage: v.condition?.secondary_damage ?? null,
    title_type: v.sale_document?.name ?? null,
    drive: v.vehicle_specs?.drive_type ?? null,
    transmission: v.vehicle_specs?.transmission ?? null,
    engine: v.vehicle_specs?.engine?.raw ?? null,
    fuel_type: v.vehicle_specs?.fuel_type ?? null,
    run_drive: v.condition?.run_condition?.value?.includes('RUNS') ?? null,
    has_keys: v.condition?.has_key ?? null,
    current_bid: v.pricing?.current_bid_usd ?? null,
    buy_now_price: v.pricing?.buy_now_usd ?? null,
    estimated_retail: null,
    currency: 'USD',
    sale_date: v.auction?.full_date ?? null,
    location_city: v.location?.display?.split(' (')[0] ?? null,
    location_state: v.location?.display?.match(/\(([^)]+)\)/)?.[1] ?? null,
    location_zip: null,
    thumbnail_url: v.media?.thumbs?.[0] ?? null,
    image_urls: v.media?.thumbs ?? [],
    source_url: v.platform === 'copart'
      ? `https://www.copart.com/lot/${v.lot_number}`
      : `https://www.iaai.com/vehdynamic/StockDetails?stocknum=${v.lot_number}`,
    scraped_at: new Date().toISOString(),
    is_active: true,
  }
}

export async function searchApibaraListings(filters: SearchFilters): Promise<SearchResult> {
  const params = new URLSearchParams()

  const page = filters.page ?? 1
  const per_page = filters.per_page ?? 25
  params.set('page', String(page))
  params.set('per_page', String(per_page))

  if (filters.source && filters.source !== 'all') params.set('platform', filters.source)
  if (filters.make) params.set('make', filters.make)
  if (filters.model) params.set('model', filters.model)
  if (filters.year_min) params.set('year_from', String(filters.year_min))
  if (filters.year_max) params.set('year_to', String(filters.year_max))
  if (filters.price_min) params.set('price_from', String(filters.price_min))
  if (filters.price_max) params.set('price_to', String(filters.price_max))
  if (filters.odometer_max) params.set('odometer_to', String(filters.odometer_max))
  if (filters.primary_damage) params.set('primary_damage', filters.primary_damage)
  if (filters.title_type) params.set('title_type', filters.title_type)
  if (filters.state) params.set('state', filters.state)

  const res = await fetch(`${BASE_URL}/vehicles?${params}`, {
    headers: apiHeaders(),
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Apibara API error: ${res.status}`)

  const json = await res.json()
  const vehicles = Array.isArray(json.data) ? json.data : []
  const total = json.meta?.total ?? vehicles.length

  return {
    listings: vehicles.map(mapListing),
    total,
    page,
    per_page,
    total_pages: Math.ceil(total / per_page),
  }
}
