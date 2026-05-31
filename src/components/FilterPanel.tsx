'use client'

import { useState } from 'react'
import { SearchFilters, DAMAGE_TYPES, TITLE_TYPES, BODY_STYLES, FUEL_TYPES, US_STATES, POPULAR_MAKES } from '@/types/auction'

interface Props {
  filters: SearchFilters
  onApply: (filters: SearchFilters) => void
}

export default function FilterPanel({ filters, onApply }: Props) {
  const [local, setLocal] = useState<SearchFilters>({ ...filters })

  const update = (key: keyof SearchFilters, value: unknown) => {
    setLocal(prev => ({ ...prev, [key]: value || undefined }))
  }

  const reset = () => {
    const empty: SearchFilters = { source: 'all', sort_by: 'sale_date', page: 1 }
    setLocal(empty)
    onApply(empty)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[#1e2d45] bg-[#0f172a]/80 text-white text-sm focus:border-brand-500 focus:outline-none transition-colors"
  const labelClass = "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-display font-600 text-white text-sm">Filters</h2>
        <button onClick={reset} className="text-xs text-slate-500 hover:text-brand-400 transition-colors">
          Clear all
        </button>
      </div>

      {/* Make */}
      <div>
        <label className={labelClass}>Make</label>
        <select value={local.make || ''} onChange={e => update('make', e.target.value)} className={inputClass}>
          {POPULAR_MAKES.map(m => (
            <option key={m} value={m === 'Any Make' ? '' : m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label className={labelClass}>Model</label>
        <input
          type="text"
          value={local.model || ''}
          onChange={e => update('model', e.target.value)}
          placeholder="Any model"
          className={inputClass}
        />
      </div>

      {/* Year range */}
      <div>
        <label className={labelClass}>Year</label>
        <div className="flex gap-2">
          <select value={local.year_min || ''} onChange={e => update('year_min', e.target.value ? Number(e.target.value) : undefined)} className={inputClass}>
            <option value="">From</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={local.year_max || ''} onChange={e => update('year_max', e.target.value ? Number(e.target.value) : undefined)} className={inputClass}>
            <option value="">To</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className={labelClass}>Current Bid ($)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={local.price_min || ''}
            onChange={e => update('price_min', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Min"
            className={inputClass}
          />
          <input
            type="number"
            value={local.price_max || ''}
            onChange={e => update('price_max', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Max"
            className={inputClass}
          />
        </div>
      </div>

      {/* Odometer */}
      <div>
        <label className={labelClass}>Max Mileage</label>
        <input
          type="number"
          value={local.odometer_max || ''}
          onChange={e => update('odometer_max', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="e.g. 50000"
          className={inputClass}
        />
      </div>

      {/* Primary Damage */}
      <div>
        <label className={labelClass}>Primary Damage</label>
        <select value={local.primary_damage || ''} onChange={e => update('primary_damage', e.target.value)} className={inputClass}>
          {DAMAGE_TYPES.map(d => (
            <option key={d} value={d === 'All Types' ? '' : d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Title Type */}
      <div>
        <label className={labelClass}>Title Type</label>
        <select value={local.title_type || ''} onChange={e => update('title_type', e.target.value)} className={inputClass}>
          {TITLE_TYPES.map(t => (
            <option key={t} value={t === 'All Titles' ? '' : t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Keys */}
      <div>
        <label className={labelClass}>Keys Present</label>
        <select value={local.keys || ''} onChange={e => update('keys', e.target.value)} className={inputClass}>
          <option value="">Any</option>
          <option value="Yes">Yes — Keys Present</option>
          <option value="No">No Keys</option>
        </select>
      </div>

      {/* Body Style */}
      <div>
        <label className={labelClass}>Body Style</label>
        <select value={local.body_style || ''} onChange={e => update('body_style', e.target.value)} className={inputClass}>
          {BODY_STYLES.map(b => (
            <option key={b} value={b === 'All Styles' ? '' : b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Fuel */}
      <div>
        <label className={labelClass}>Fuel Type</label>
        <select value={local.fuel_type || ''} onChange={e => update('fuel_type', e.target.value)} className={inputClass}>
          {FUEL_TYPES.map(f => (
            <option key={f} value={f === 'All Fuels' ? '' : f}>{f}</option>
          ))}
        </select>
      </div>

      {/* State */}
      <div>
        <label className={labelClass}>Location (State)</label>
        <select value={local.location_state || ''} onChange={e => update('location_state', e.target.value)} className={inputClass}>
          {US_STATES.map(s => (
            <option key={s} value={s === 'All States' ? '' : s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Apply button */}
      <button
        onClick={() => onApply(local)}
        className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-xl transition-colors"
      >
        Apply Filters
      </button>
    </div>
  )
}
