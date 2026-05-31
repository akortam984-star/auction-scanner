import { NextRequest, NextResponse } from 'next/server'
import { searchApibaraListings } from '@/lib/apibara'
import { SearchFilters } from '@/types/auction'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const filters: SearchFilters = {
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
    per_page: 25,
  }

  try {
    const result = await searchApibaraListings(filters)
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    console.error('[Search API error]', err)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}
