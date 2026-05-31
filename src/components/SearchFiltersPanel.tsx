// src/components/SearchFiltersPanel.tsx
import type { SearchFilters, FilterOptions } from "@/types/listing";

interface Props {
  filters: SearchFilters;
  options: FilterOptions;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function SearchFiltersPanel({ filters, options }: Props) {
  return (
    <form method="GET" action="/search" className="space-y-5">
      {/* Source toggle */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Auction Source
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All" },
            { value: "copart", label: "Copart" },
            { value: "iaai", label: "IAAI" },
          ].map(({ value, label }) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="source"
                value={value}
                defaultChecked={(filters.source ?? "all") === value}
                className="sr-only peer"
              />
              <span className="peer-checked:bg-brand-600 peer-checked:text-white peer-checked:border-brand-600 border border-slate-300 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors block">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Search
        </label>
        <input
          type="text"
          name="q"
          defaultValue={filters.query}
          placeholder="Make, model, VIN…"
          className="input"
        />
      </div>

      {/* Make */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Make
        </label>
        <select name="make" defaultValue={filters.make ?? ""} className="select">
          <option value="">Any make</option>
          {options.makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Model
        </label>
        <input type="text" name="model" defaultValue={filters.model} placeholder="Any model" className="input" />
      </div>

      {/* Year range */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Year
        </label>
        <div className="flex gap-2">
          <input type="number" name="year_min" defaultValue={filters.year_min} placeholder="From"
            min={1990} max={CURRENT_YEAR} className="input" />
          <input type="number" name="year_max" defaultValue={filters.year_max} placeholder="To"
            min={1990} max={CURRENT_YEAR} className="input" />
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Bid Price
        </label>
        <div className="flex gap-2">
          <input type="number" name="price_min" defaultValue={filters.price_min} placeholder="Min $" className="input" />
          <input type="number" name="price_max" defaultValue={filters.price_max} placeholder="Max $" className="input" />
        </div>
      </div>

      {/* Odometer */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Max Mileage
        </label>
        <input type="number" name="odometer_max" defaultValue={filters.odometer_max}
          placeholder="e.g. 150000" className="input" />
      </div>

      {/* Damage type */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Primary Damage
        </label>
        <select name="damage" defaultValue={filters.primary_damage ?? ""} className="select">
          <option value="">Any damage</option>
          {options.damage_types.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Title type */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Title Type
        </label>
        <select name="title" defaultValue={filters.title_type ?? ""} className="select">
          <option value="">Any title</option>
          {options.title_types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* State */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          State
        </label>
        <select name="state" defaultValue={filters.state ?? ""} className="select">
          <option value="">Any state</option>
          {options.states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Condition
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="run_drive"
            value="true"
            defaultChecked={filters.run_drive === true}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>Run &amp; Drive only</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="has_keys"
            value="true"
            defaultChecked={filters.has_keys === true}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>Has keys</span>
        </label>
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary w-full justify-center">
        Apply Filters
      </button>
      <a href="/search" className="btn-outline w-full justify-center text-center block">
        Clear All
      </a>
    </form>
  );
}
