import { AuctionListing, SearchFilters } from '@/types/auction'

const COPART_BASE = 'https://www.copart.com'
const COPART_API = 'https://api.copart.com'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.copart.com/vehicleFinder/',
  'Origin': 'https://www.copart.com',
}

interface CopartSearchBody {
  query: string[]
  filter: Record<string, string[]>
  sort: string
  page: number
  size: number
}

function buildCopartBody(filters: SearchFilters): CopartSearchBody {
  const query: string[] = []
  const filter: Record<string, string[]> = {}

  if (filters.make && filters.make !== 'Any Make') query.push(filters.make.toUpperCase())
  if (filters.model) query.push(filters.model.toUpperCase())
  
  if (filters.year_min || filters.year_max) {
    const min = filters.year_min || 1990
    const max = filters.year_max || new Date().getFullYear() + 1
    filter['dd.yr'] = [`[${min} TO ${max}]`]
  }
  if (filters.primary_damage && filters.primary_damage !== 'All Types') {
    filter['dd.dmg'] = [filters.primary_damage.toUpperCase()]
  }
  if (filters.title_type && filters.title_type !== 'All Titles') {
    filter['dd.ttyp'] = [filters.title_type.toUpperCase()]
  }
  if (filters.location_state && filters.location_state !== 'All States') {
    filter['dd.lDes'] = [filters.location_state]
  }
  if (filters.body_style && filters.body_style !== 'All Styles') {
    filter['dd.styp'] = [filters.body_style.toUpperCase()]
  }
  if (filters.fuel_type && filters.fuel_type !== 'All Fuels') {
    filter['dd.ft'] = [filters.fuel_type.toUpperCase()]
  }
  if (filters.keys && filters.keys !== 'All') {
    filter['dd.hk'] = [filters.keys === 'Yes' ? 'YES' : 'NO']
  }

  let sort = 'auction_date_utc asc'
  switch (filters.sort_by) {
    case 'price_asc': sort = 'buy_today_bid asc'; break
    case 'price_desc': sort = 'buy_today_bid desc'; break
    case 'year_desc': sort = 'year desc'; break
    case 'odometer_asc': sort = 'orgnl_doss_val_nm asc'; break
  }

  return {
    query: query.length > 0 ? query : ['*'],
    filter,
    sort,
    page: (filters.page || 1) - 1,
    size: filters.per_page || 25,
  }
}

function parseCopartLot(lot: Record<string, unknown>): AuctionListing {
  const lotNum = String(lot.lotNumberStr || lot.ln || lot.lot_number || '')
  const images: string[] = []
  if (lot.thC && typeof lot.thC === 'string') {
    images.push(`https://cs.copart.com/v1/AUTH_svc.pdoc00001/${lot.thC}`)
  }

  return {
    id: `copart-${lotNum}`,
    source: 'copart',
    lot_number: lotNum,
    vin: (lot.fv as string) || null,
    year: Number(lot.lcy || lot.y || 0) || null,
    make: String(lot.mkn || lot.mk || ''),
    model: String(lot.mdn || lot.m || ''),
    trim: (lot.td as string) || null,
    body_style: (lot.bstl as string) || null,
    color: (lot.clr as string) || null,
    odometer: Number(lot.orgnl_doss_val_nm || lot.od || 0) || null,
    odometer_unit: (lot.orgnl_doss_unit_nm as string) || 'mi',
    primary_damage: (lot.dd as string) || null,
    secondary_damage: (lot.sdd as string) || null,
    title_type: (lot.ttyp as string) || null,
    title_state: (lot.tst as string) || null,
    keys: (lot.hk as string) || null,
    fuel_type: (lot.ft as string) || null,
    transmission: (lot.tsmssn as string) || null,
    drive: (lot.drv as string) || null,
    engine: (lot.egn as string) || null,
    cylinders: (lot.cyl as string) || null,
    current_bid: Number(lot.buy_today_bid || lot.cb || 0) || null,
    buy_now_price: Number(lot.bn || 0) || null,
    sale_date: (lot.ad as string) || (lot.auction_date_utc as string) || null,
    location: (lot.yn as string) || (lot.yard_name as string) || null,
    location_state: (lot.yS as string) || null,
    images,
    thumbnail: images[0] || null,
    source_url: `https://www.copart.com/lot/${lotNum}`,
    loss_type: (lot.lt as string) || null,
    condition_grade: null,
    seller: (lot.selr as string) || null,
    highlights: [],
    scraped_at: new Date().toISOString(),
  }
}

export async function scrapeCopart(
  filters: SearchFilters
): Promise<{ listings: AuctionListing[]; total: number }> {
  try {
    const body = buildCopartBody(filters)
    const res = await fetch(`${COPART_API}/public/lots/search`, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const lots = data?.data?.results?.content || data?.results?.content || []
    const total = data?.data?.results?.totalElements || data?.results?.totalElements || 0
    return { listings: lots.map(parseCopartLot), total }
  } catch (err) {
    console.error('[Copart scraper error]', err)
    return { listings: [], total: 0 }
  }
}
