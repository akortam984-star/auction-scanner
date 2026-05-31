// src/components/Pagination.tsx
import type { SearchFilters } from "@/types/listing";
import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  filters: SearchFilters;
}

function buildUrl(filters: SearchFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.query)          params.set("q", filters.query);
  if (filters.source && filters.source !== "all") params.set("source", filters.source);
  if (filters.make)           params.set("make", filters.make);
  if (filters.model)          params.set("model", filters.model);
  if (filters.year_min)       params.set("year_min", String(filters.year_min));
  if (filters.year_max)       params.set("year_max", String(filters.year_max));
  if (filters.price_min)      params.set("price_min", String(filters.price_min));
  if (filters.price_max)      params.set("price_max", String(filters.price_max));
  if (filters.odometer_max)   params.set("odometer_max", String(filters.odometer_max));
  if (filters.primary_damage) params.set("damage", filters.primary_damage);
  if (filters.title_type)     params.set("title", filters.title_type);
  if (filters.run_drive !== undefined) params.set("run_drive", String(filters.run_drive));
  if (filters.has_keys !== undefined)  params.set("has_keys", String(filters.has_keys));
  if (filters.state)          params.set("state", filters.state);
  if (filters.sort_by)        params.set("sort", filters.sort_by);
  params.set("page", String(page));
  return `/search?${params}`;
}

export default function Pagination({ page, totalPages, filters }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1">
      {page > 1 && (
        <Link href={buildUrl(filters, page - 1)} className="btn-outline px-3 py-2">
          ←
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={buildUrl(filters, p)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? "bg-brand-600 text-white"
              : "border border-slate-300 hover:border-brand-500 hover:text-brand-600"
          }`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={buildUrl(filters, page + 1)} className="btn-outline px-3 py-2">
          →
        </Link>
      )}
    </div>
  );
}
