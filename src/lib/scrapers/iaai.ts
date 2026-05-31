import { AuctionListing, SearchFilters } from '@/types/auction'

const IAAI_BASE = 'https://www.iaai.com'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.iaai.com/Vehiclelisting/Search',
  'Origin': 'https://www.iaai.com',
  'x-requested-with': 'XMLHttpRequest',
}

function buildIaaiParams(filters: SearchFilters): URLSearchParams {
  const p = new URLSearchParams()

  if (filters.make && filters.make !== 'Any Make') p.set('makeDesc', filters.make)
  if (filters.model) p.set('modelDesc', filters.model)
  if (filters.year_min) p.set('startYear', String(filters.year_min))
  if (filters.year_max) p.set('endYear', String(filters.year_max))
  if (filters.primary_damage && filters.primary_damage !== 'All Types') {
    p.set('primaryDamage', filters.primary_damage)
  }
  if (filters.title_type && filters.title_type !== 'All Titles') {
    p.set('titleType', filters.title_type)
  }
  if (filters.location_state && filters.location_state !== 'All States') {
    p.set('stateCode', filters.location_state)
  }
  if (filters.body_style && filters.body_style !== 'All Styles') {
    p.set('bodyStyle', filters.body_style)
  }
  if (filters.fuel_type && filters.fuel_type !== 'All Fuels') {
    p.set('fuelType', filters.fuel_type)
  }
  if (filters.keys && filters.keys !== 'All') {
    p.set('hasKeys', filters.keys === 'Yes' ? 'true' : 'false')
  }
  if (filters.odometer_max) p.set('maxOdometer', String(filters.odometer_max))

  p.set('pageNumber', String(filters.page || 1))
  p.set('pageSize', String(filters.per_page || 25))
  p.set('sortBy', 'SaleDate')
  p.set('sortOrder', 'asc')

  return p
}

function parseIaaiItem(item: Record<string, unknown>): AuctionListing {
  const stockNum = String(item.stockNumber || item.StockNumber || item.lotNumber || '')
  
  // Build IAAI image URL
  const images: string[] = []
  if (item.imageUrl && typeof item.imageUrl === 'string') {
    images.push(item.imageUrl)
  } else if (item.ImageUrl && typeof item.ImageUrl === 'string') {
    images.push(item.ImageUrl)
  } else if (stockNum) {
    // IAAI image URL pattern
    images.push(`https://img.iaai.com/images/${stockNum}/1/0_low.jpg`)
  }

  const make = String(item.make || item.Make || item.vehicleMake || '')
  const model = String(item.model || item.Model || item.vehicleModel || '')
  const year = Number(item.year || item.Year || item.vehicleYear || 0)
  const saleDate = (item.saleDate || item.SaleDate || item.auctionDate || '') as string

  return {
    id: `iaai-${stockNum}`,
    source: 'iaai',
    lot_number: stockNum,
    vin: (item.vin || item.Vin || item.VIN || null) as string | null,
    year: year || null,
    make,
    model,
    trim: (item.series || item.trim || null) as string | null,
    body_style: (item.bodyStyle || item.BodyStyle || null) as string | null,
    color: (item.color || item.Color || null) as string | null,
    odometer: Number(item.odometer || item.Odometer || 0) || null,
    odometer_unit: (item.odometerUnit || 'mi') as string,
    primary_damage: (item.primaryDamage || item.PrimaryDamage || null) as string | null,
    secondary_damage: (item.secondaryDamage || null) as string | null,
    title_type: (item.titleType || item.TitleType || null) as string | null,
    title_state: (item.titleState || null) as string | null,
    keys: (item.hasKeys !== undefined ? (item.hasKeys ? 'YES' : 'NO') : null) as string | null,
    fuel_type: (item.fuelType || null) as string | null,
    transmission: (item.transmission || null) as string | null,
    drive: (item.drivelineName || null) as string | null,
    engine: (item.engine || null) as string | null,
    cylinders: (item.cylinders || null) as string | null,
    current_bid: Number(item.currentBid || item.CurrentBid || item.bidAmount || 0) || null,
    buy_now_price: Number(item.buyNowPrice || 0) || null,
    sale_date: saleDate || null,
    location: (item.branchName || item.location || null) as string | null,
    location_state: (item.stateCode || item.state || null) as string | null,
    images,
    thumbnail: images[0] || null,
    source_url: `https://www.iaai.com/vehicles/${make.toLowerCase()}-${model.toLowerCase()}-${year}/${stockNum}`,
    loss_type: (item.lossType || null) as string | null,
    condition_grade: (item.conditionGrade || item.grade || null) as string | null,
    seller: (item.sellerName || null) as string | null,
    highlights: [],
    scraped_at: new Date().toISOString(),
  }
}

export async function scrapeIAAI(
  filters: SearchFilters
): Promise<{ listings: AuctionListing[]; total: number }> {
  try {
    const params = buildIaaiParams(filters)
    
    // IAAI public search API
    const res = await fetch(`${IAAI_BASE}/api/search?${params.toString()}`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      // Try alternate endpoint format
      return await scrapeIAAIAlt(filters)
    }

    const data = await res.json()
    // Handle multiple possible response shapes
    const items = data?.items || data?.results || data?.data?.items || data?.vehicles || []
    const total = data?.total || data?.totalCount || data?.data?.total || 0

    return {
      listings: items.map(parseIaaiItem),
      total,
    }
  } catch (err) {
    console.error('[IAAI scraper error]', err)
    return await scrapeIAAIAlt(filters)
  }
}

async function scrapeIAAIAlt(
  filters: SearchFilters
): Promise<{ listings: AuctionListing[]; total: number }> {
  try {
    const params = buildIaaiParams(filters)
    
    const res = await fetch(`${IAAI_BASE}/Search?${params.toString()}`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error(`IAAI alt HTTP ${res.status}`)
    const data = await res.json()
    const items = data?.Items || data?.items || []
    const total = data?.TotalCount || data?.total || 0

    return { listings: items.map(parseIaaiItem), total }
  } catch {
    return { listings: [], total: 0 }
  }
}
