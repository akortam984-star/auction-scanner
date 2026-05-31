import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const APIBARA_BASE = 'https://apibara.tech/api/v1/vehicle-auction'
const API_KEY = process.env.APIBARA_API_KEY!
const CRON_SECRET = process.env.CRON_SECRET!

const PER_PAGE = 25
const MAX_PAGES = 4 // 100 listings per run (stays within free quota)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToRow(v: any) {
  const source = v.platform === 'copart' ? 'copart' : 'iaai'
  const state = v.location?.display?.match(/\(([^)]+)\)/)?.[1] ?? null
  const city = v.location?.display?.split(' (')[0] ?? null
  const thumbs: string[] = v.media?.thumbs ?? []

  return {
    source,
    lot_number: String(v.lot_number ?? ''),
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
    location_city: city,
    location_state: state,
    location_zip: null,
    thumbnail_url: thumbs[0] ?? null,
    image_urls: thumbs,
    source_url: source === 'copart'
      ? `https://www.copart.com/lot/${v.lot_number}`
      : `https://www.iaai.com/vehdynamic/StockDetails?stocknum=${v.lot_number}`,
    scraped_at: new Date().toISOString(),
    is_active: true,
  }
}

async function fetchPage(page: number) {
  const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) })
  const res = await fetch(`${APIBARA_BASE}/vehicles?${params}`, {
    headers: { 'X-API-Key': API_KEY },
  })
  if (!res.ok) throw new Error(`Apibara error: ${res.status}`)
  const json = await res.json()
  return Array.isArray(json.data) ? json.data : []
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceClient()
  const startedAt = new Date().toISOString()
  let totalUpserted = 0
  let error: string | null = null

  // Log start
  const { data: logRow } = await db.from('scrape_log').insert({
    source: 'all',
    started_at: startedAt,
    status: 'running',
  }).select('id').single()

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const vehicles = await fetchPage(page)
      if (vehicles.length === 0) break

      const rows = vehicles.map(mapToRow)

      const { error: upsertErr } = await db
        .from('listings')
        .upsert(rows, { onConflict: 'source,lot_number' })

      if (upsertErr) throw new Error(upsertErr.message)

      totalUpserted += rows.length
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  // Update log
  if (logRow?.id) {
    await db.from('scrape_log').update({
      ended_at: new Date().toISOString(),
      rows_added: totalUpserted,
      status: error ? 'error' : 'success',
      error,
    }).eq('id', logRow.id)
  }

  return NextResponse.json({ ok: !error, upserted: totalUpserted, error })
}
