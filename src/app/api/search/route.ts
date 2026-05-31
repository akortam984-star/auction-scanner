import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AuctionListing, SearchFilters, SearchResult } from '@/types/auction'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const source = (searchParams.get('source') as SearchFilters['source']) || 'all'
  const make = searchParams.get('make') || undefined
  const model = searchParams.get('model') || undefined
  const year_min = searchParams.get('year_min') ? Number(searchParams.get('year_min')) : undefined
  const year_max = searchParams.get('year_max') ? Number(searchParams.get('year_max')) : undefined
  const price_min = searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined
  const price_max = searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined
  const odometer_max = searchParams.get('odometer_max') ? Number(searchParams.get('odometer_max')) : undefined
  const primary_damage = searchParams.get('primary_damage') || undefined
  const title_type = searchParams.get('title_type') || undefined
  const location_state = searchParams.get('location_state') || undefined
  const sort_by = searchParams.get('sort_by') || 'sale_date'
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
  const per_page = 25

  try {
    let q = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (source && source !== 'all') q = q.eq('source', source)
    if (make) q = q.ilike('make', `%${make}%`)
    if (model) q = q.ilike('model', `%${model}%`)
    if (year_min) q = q.gte('year', year_min)
    if (year_max) q = q.lte('year', year_max)
    if (price_min) q = q.gte('current_bid', price_min)
    if (price_max) q = q.lte('current_bid', price_max)
    if (odometer_max) q = q.lte('odometer', odometer_max)
    if (primary_damage) q = q.ilike('primary_damage', `%${primary_damage}%`)
    if (title_type) q = q.ilike('title_type', `%${title_type}%`)
    if (location_state) q = q.eq('location_state', location_state)

    switch (sort_by) {
      case 'price_asc':    q = q.order('current_bid', { ascending: true, nullsFirst: false }); break
      case 'price_desc':   q = q.order('current_bid', { ascending: false, nullsFirst: false }); break
      case 'year_desc':    q = q.order('year', { ascending: false, nullsFirst: false }); break
      case 'odometer_asc': q = q.order('odometer', { ascending: true, nullsFirst: false }); break
      default:             q = q.order('sale_date', { ascending: true, nullsFirst: false }); break
    }

    const from = (page - 1) * per_page
    q = q.range(from, from + per_page - 1)

    const { data, count, error } = await q
    if (error) throw error

    // Map DB rows to AuctionListing shape expected by the UI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listings: AuctionListing[] = (data ?? []).map((row: any) => ({
      id: row.id,
      source: row.source,
      lot_number: row.lot_number,
      vin: row.vin,
      year: row.year,
      make: row.make ?? '',
      model: row.model ?? '',
      trim: row.trim,
      body_style: row.body_style,
      color: row.color,
      odometer: row.odometer,
      odometer_unit: row.odometer_unit ?? 'mi',
      primary_damage: row.primary_damage,
      secondary_damage: row.secondary_damage,
      title_type: row.title_type,
      title_state: null,
      keys: row.has_keys === true ? 'Yes' : row.has_keys === false ? 'No' : null,
      fuel_type: row.fuel_type,
      transmission: row.transmission,
      drive: row.drive,
      engine: row.engine,
      cylinders: null,
      current_bid: row.current_bid ? Number(row.current_bid) : null,
      buy_now_price: row.buy_now_price ? Number(row.buy_now_price) : null,
      sale_date: row.sale_date,
      location: row.location_city && row.location_state
        ? `${row.location_city} (${row.location_state})`
        : row.location_city ?? row.location_state ?? null,
      location_state: row.location_state,
      images: row.image_urls ?? [],
      thumbnail: row.thumbnail_url,
      source_url: row.source_url,
      loss_type: null,
      condition_grade: null,
      seller: null,
      highlights: [],
      scraped_at: row.scraped_at,
    }))

    const total = count ?? 0
    const result: SearchResult = {
      listings,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
      sources: {
        copart: listings.filter(l => l.source === 'copart').length,
        iaai: listings.filter(l => l.source === 'iaai').length,
      },
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (err) {
    console.error('[Search API error]', err)
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}
