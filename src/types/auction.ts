export type AuctionSource = 'copart' | 'iaai'

export interface AuctionListing {
  id: string
  source: AuctionSource
  lot_number: string
  vin: string | null
  year: number | null
  make: string
  model: string
  trim: string | null
  body_style: string | null
  color: string | null
  odometer: number | null
  odometer_unit: string
  primary_damage: string | null
  secondary_damage: string | null
  title_type: string | null
  title_state: string | null
  keys: string | null
  fuel_type: string | null
  transmission: string | null
  drive: string | null
  engine: string | null
  cylinders: string | null
  current_bid: number | null
  buy_now_price: number | null
  sale_date: string | null
  location: string | null
  location_state: string | null
  images: string[]
  thumbnail: string | null
  source_url: string
  loss_type: string | null
  condition_grade: string | null
  seller: string | null
  highlights: string[]
  scraped_at: string
}

export interface SearchFilters {
  make?: string
  model?: string
  year_min?: number
  year_max?: number
  price_min?: number
  price_max?: number
  odometer_max?: number
  primary_damage?: string
  title_type?: string
  keys?: string
  fuel_type?: string
  transmission?: string
  body_style?: string
  location_state?: string
  source?: AuctionSource | 'all'
  sale_date_from?: string
  sort_by?: 'sale_date' | 'price_asc' | 'price_desc' | 'year_desc' | 'odometer_asc'
  page?: number
  per_page?: number
}

export interface SearchResult {
  listings: AuctionListing[]
  total: number
  page: number
  per_page: number
  total_pages: number
  sources: {
    copart: number
    iaai: number
  }
}

// Filter options for the UI
export const DAMAGE_TYPES = [
  'All Types',
  'Front End',
  'Rear End',
  'Side',
  'Rollover',
  'Hail',
  'Flood',
  'Fire',
  'Mechanical',
  'Vandalism',
  'Glass',
  'Minor Dents/Scratches',
  'Stripped',
  'Unknown',
] as const

export const TITLE_TYPES = [
  'All Titles',
  'Salvage',
  'Clean',
  'Rebuilt',
  'Certificate of Destruction',
  'Non-Repairable',
  'Parts Only',
] as const

export const BODY_STYLES = [
  'All Styles',
  'Sedan',
  'SUV',
  'Pickup',
  'Coupe',
  'Wagon',
  'Hatchback',
  'Minivan',
  'Van',
  'Convertible',
] as const

export const FUEL_TYPES = [
  'All Fuels',
  'Gas',
  'Diesel',
  'Hybrid',
  'Electric',
  'Flex Fuel',
] as const

export const US_STATES = [
  'All States',
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
] as const

export const POPULAR_MAKES = [
  'Any Make',
  'Acura','Audi','BMW','Buick','Cadillac','Chevrolet',
  'Chrysler','Dodge','Ford','GMC','Honda','Hyundai',
  'Infiniti','Jeep','Kia','Land Rover','Lexus','Lincoln',
  'Mazda','Mercedes-Benz','Mitsubishi','Nissan','Porsche',
  'RAM','Subaru','Tesla','Toyota','Volkswagen','Volvo',
] as const
