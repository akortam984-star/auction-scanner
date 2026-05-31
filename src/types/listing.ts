// src/types/listing.ts

export type AuctionSource = "copart" | "iaai";

export interface Listing {
  id: string;                    // internal UUID (Supabase)
  source: AuctionSource;
  lot_number: string;
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  body_style: string | null;
  color: string | null;
  odometer: number | null;
  odometer_unit: "mi" | "km";
  primary_damage: string | null;
  secondary_damage: string | null;
  title_type: string | null;     // Salvage, Clean, Rebuilt, etc.
  drive: string | null;          // FWD, RWD, AWD, 4WD
  transmission: string | null;
  engine: string | null;
  fuel_type: string | null;
  run_drive: boolean | null;
  has_keys: boolean | null;
  current_bid: number | null;
  buy_now_price: number | null;
  estimated_retail: number | null;
  currency: string;
  sale_date: string | null;      // ISO date string
  location_city: string | null;
  location_state: string | null;
  location_zip: string | null;
  thumbnail_url: string | null;
  image_urls: string[];
  source_url: string;            // link back to original listing
  scraped_at: string;            // ISO timestamp
  is_active: boolean;
}

export interface SearchFilters {
  query?: string;
  source?: AuctionSource | "all";
  make?: string;
  model?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  odometer_max?: number;
  primary_damage?: string;
  title_type?: string;
  run_drive?: boolean;
  has_keys?: boolean;
  state?: string;
  sort_by?: "price_asc" | "price_desc" | "year_desc" | "odometer_asc" | "sale_date_asc";
  page?: number;
  per_page?: number;
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Options for filter dropdowns — populated from DB distinct values
export interface FilterOptions {
  makes: string[];
  states: string[];
  damage_types: string[];
  title_types: string[];
}
