'use client'

import { AuctionListing } from '@/types/auction'
import { useState } from 'react'

interface Props {
  listing: AuctionListing
}

export default function ListingCard({ listing }: Props) {
  const [imgError, setImgError] = useState(false)

  const formattedBid = listing.current_bid
    ? `$${listing.current_bid.toLocaleString()}`
    : 'No bid'

  const formattedMiles = listing.odometer
    ? `${listing.odometer.toLocaleString()} mi`
    : 'N/A'

  const saleDate = listing.sale_date
    ? new Date(listing.sale_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const title = [listing.year, listing.make, listing.model].filter(Boolean).join(' ')

  return (
    <a
      href={listing.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="card rounded-2xl overflow-hidden card-hover group flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 bg-[#0f172a] overflow-hidden flex-shrink-0">
        {listing.thumbnail && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
        )}

        {/* Source badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            listing.source === 'copart' ? 'badge-copart' : 'badge-iaai'
          }`}>
            {listing.source === 'copart' ? 'Copart' : 'IAAI'}
          </span>
        </div>

        {/* Title badge */}
        {listing.title_type && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-md text-xs bg-[#0f172a]/80 text-slate-300 border border-[#1e2d45]/60">
              {listing.title_type}
            </span>
          </div>
        )}

        {/* Current bid overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#050c18]/90 to-transparent px-3 py-3">
          <span className="font-display text-xl font-700 text-white">{formattedBid}</span>
          {listing.buy_now_price && (
            <span className="text-xs text-slate-400 ml-2">
              BIN: ${listing.buy_now_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-display font-600 text-white text-base leading-tight mb-0.5">
            {title || 'Unknown Vehicle'}
          </h3>
          {listing.trim && (
            <p className="text-slate-500 text-xs">{listing.trim}</p>
          )}
        </div>

        {/* Key stats grid */}
        <div className="grid grid-cols-2 gap-y-1.5 text-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600 text-xs">🔧</span>
            <span className="text-xs">{listing.primary_damage || 'Unknown damage'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600 text-xs">📍</span>
            <span className="text-xs">{listing.location_state || listing.location || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600 text-xs">🚗</span>
            <span className="text-xs">{formattedMiles}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-600 text-xs">🔑</span>
            <span className="text-xs">{listing.keys || 'Unknown'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-[#1e2d45]/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {saleDate && (
              <>
                <span>📅</span>
                <span>{saleDate}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-brand-400 text-xs font-medium group-hover:gap-2 transition-all">
            View on {listing.source === 'copart' ? 'Copart' : 'IAAI'}
            <span>↗</span>
          </div>
        </div>
      </div>
    </a>
  )
}
