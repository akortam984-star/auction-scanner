# AuctionScanner

Unified salvage vehicle auction search — Copart + IAAI in one place.

## Stack
- **Next.js 15** (App Router, server components)
- **Supabase** (cache layer + future DB)
- **Tailwind CSS**
- **Deploy**: Vercel

## Setup

### 1. Clone & install
```bash
git clone https://github.com/akortam984-star/auction-scanner
cd auction-scanner
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://vkzeastiznjjqoovmkrs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase_dashboard
```

Get your anon key from: Supabase Dashboard → Project Settings → API

### 3. Set up Supabase
Run `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
1. Push to GitHub
2. Import repo at vercel.com
3. Add environment variables in Vercel dashboard
4. Deploy

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── search/page.tsx       # Search page (server)
│   ├── about/page.tsx        # About page
│   └── api/
│       └── search/route.ts   # Search API endpoint
├── components/
│   ├── SearchPageClient.tsx  # Search UI (client)
│   ├── FilterPanel.tsx       # Filter sidebar
│   └── ListingCard.tsx       # Individual listing card
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── scrapers/
│       ├── index.ts          # Orchestrator + cache
│       ├── copart.ts         # Copart scraper
│       └── iaai.ts           # IAAI scraper
└── types/
    └── auction.ts            # TypeScript types + constants
```

## How scraping works

We fetch from Copart's and IAAI's **public search endpoints** — the same data 
anyone can access without an account. Results are cached in Supabase for 10 minutes 
to minimize requests. All listing links point back to the original source.

**Legal basis**: Public data indexing is protected by US courts (hiQ v. LinkedIn, 
Meta v. Bright Data 2024). We do not bypass authentication or access restricted data.

## Roadmap
- [ ] AI damage analysis from photos
- [ ] Repair cost estimator
- [ ] Dealer budget profiles  
- [ ] Local resale value (CarGurus/AutoTrader)
- [ ] Email/SMS alerts
