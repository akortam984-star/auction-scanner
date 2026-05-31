import type { AuctionListing, SearchFilters, SearchResult } from '@/types/auction'

const BASE_URL = 'https://apibara.tech/api/v1/vehicle-auction'
const API_KEY = process.env.APIBARA_API_KEY!

function apiHeaders() {
  return { 'X-API-Key': API_KEY }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListing(v: any): AuctionListing {
  const lotNum = v.lot_number ?? ''
  const source = v.platform === 'copart' ? 'copart' : 'iaai'
  const thumbs: string[] = v.media?.thumbs ?? []
  const state = v.location?.display?.match(/\(([^)]+)\)/)?.[1] ?? null

  return {
    id: `${source}-${lotNum}`,
    source,
    lot_number: lotNum,
    vin: v.vin ?? null,
    year: v.year ?? null,
    make: v.make ?? '',
    model: v.model ?? '',
    trim: v.details?.attributes?.Series ?? null,
    body_style: v.vehicle_specs?.body_style ?? null,
    color: v.vehicle_specs?.exterior_color ?? null,
    odometer: v.odometer?.mi ?? null,
    odometer_unit: 'mi',
    primary_damage: v.condition?.primary_damage ?? null,
    secondary_damage: v.condition?.secondary_damage ?? null,
    title_type: v.sale_document?.name ?? null,
    title_state: null,
    keys: v.condition?.has_key ? 'Yes' : v.condition?.has_key === false ? 'No' : null,
    fuel_type: v.vehicle_specs?.fuel_type ?? null,
    transmission: v.vehicle_specs?.transmission ?? null,
    drive: v.vehicle_specs?.drive_type ?? null,
    engine: v.vehicle_specs?.engine?.raw ?? null,
    cylinders: null,
    current_bid: v.pricing?.current_bid_usd ?? null,
    buy_now_price: v.pricing?.buy_now_usd ?? null,
    sale_date: v.auction?.full_date ?? null,
    location: v.location?.display ?? null,
    location_state: state,
    images: thumbs,
    thumbnail: thumbs[0] ?? null,
    source_url: source === 'copart'
      ? `https://www.copart.com/lot/${lotNum}`
      : `https://www.iaai.com/vehdynamic/StockDetails?stocknum=${lotNum}`,
    loss_type: null,
    condition_grade: null,
    seller: v.seller?.name ?? null,
    highlights: [],
    scraped_at: new Date().toISOString(),
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
  if (filters.location_state) params.set('state', filters.location_state)

  const res = await fetch(`${BASE_URL}/vehicles?${params}`, {
    headers: apiHeaders(),
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`Apibara API error: ${res.status}`)

  const json = await res.json()
  const vehicles = Array.isArray(json.data) ? json.data : []
  const total = json.meta?.total ?? vehicles.length
  const listings = vehicles.map(mapListing)

  return {
    listings,
    total,
    page,
    per_page,
    total_pages: Math.ceil(total / per_page),
    sources: {
      copart: listings.filter((l: AuctionListing) => l.source === 'copart').length,
      iaai: listings.filter((l: AuctionListing) => l.source === 'iaai').length,
    },
  }
}
