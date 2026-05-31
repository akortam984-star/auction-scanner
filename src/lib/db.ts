// src/lib/db.ts
// All writes use the service role client (bypasses RLS).
// Reads use the anon client (respects RLS).

import { getServiceClient, supabase } from "./supabase";
import type { Listing, SearchFilters, SearchResult, FilterOptions } from "@/types/listing";

const UPSERT_BATCH = 500;

/** Upsert a batch of scraped listings — on conflict (source, lot_number) update. */
export async function upsertListings(listings: Listing[]): Promise<{ added: number; updated: number }> {
  const db = getServiceClient();
  let added = 0;
  let updated = 0;

  for (let i = 0; i < listings.length; i += UPSERT_BATCH) {
    const batch = listings.slice(i, i + UPSERT_BATCH).map((l) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...row } = l; // let Supabase generate the UUID
      return row;
    });

    const { error, count } = await db
      .from("listings")
      .upsert(batch, {
        onConflict: "source,lot_number",
        count: "exact",
      });

    if (error) {
      console.error("[db] upsert error", error.message);
    } else {
      // Supabase count on upsert includes both inserted and updated rows
      added += count ?? 0;
    }
  }

  return { added, updated };
}

/** Mark old lots as inactive (not seen in latest scrape). */
export async function deactivateOldLots(source: "copart" | "iaai", activeLotNumbers: string[]) {
  const db = getServiceClient();
  if (activeLotNumbers.length === 0) return;

  await db
    .from("listings")
    .update({ is_active: false })
    .eq("source", source)
    .not("lot_number", "in", `(${activeLotNumbers.map((n) => `"${n}"`).join(",")})`);
}

/** Search listings with filters — returns paginated results. */
export async function searchListings(filters: SearchFilters): Promise<SearchResult> {
  const {
    query,
    source,
    make,
    model,
    year_min,
    year_max,
    price_min,
    price_max,
    odometer_max,
    primary_damage,
    title_type,
    run_drive,
    has_keys,
    state,
    sort_by = "sale_date_asc",
    page = 1,
    per_page = 24,
  } = filters;

  let q = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (source && source !== "all") q = q.eq("source", source);
  if (make) q = q.ilike("make", `%${make}%`);
  if (model) q = q.ilike("model", `%${model}%`);
  if (year_min) q = q.gte("year", year_min);
  if (year_max) q = q.lte("year", year_max);
  if (price_min) q = q.gte("current_bid", price_min);
  if (price_max) q = q.lte("current_bid", price_max);
  if (odometer_max) q = q.lte("odometer", odometer_max);
  if (primary_damage) q = q.ilike("primary_damage", `%${primary_damage}%`);
  if (title_type) q = q.ilike("title_type", `%${title_type}%`);
  if (run_drive !== undefined) q = q.eq("run_drive", run_drive);
  if (has_keys !== undefined) q = q.eq("has_keys", has_keys);
  if (state) q = q.eq("location_state", state);

  // Full-text search on make + model + VIN
  if (query) {
    q = q.textSearch("make,model,vin", query, { type: "websearch", config: "english" });
  }

  // Sorting
  switch (sort_by) {
    case "price_asc":   q = q.order("current_bid", { ascending: true, nullsFirst: false }); break;
    case "price_desc":  q = q.order("current_bid", { ascending: false, nullsFirst: false }); break;
    case "year_desc":   q = q.order("year", { ascending: false, nullsFirst: false }); break;
    case "odometer_asc":q = q.order("odometer", { ascending: true, nullsFirst: false }); break;
    default:            q = q.order("sale_date", { ascending: true, nullsFirst: false }); break;
  }

  // Pagination
  const from = (page - 1) * per_page;
  q = q.range(from, from + per_page - 1);

  const { data, count, error } = await q;
  if (error) throw error;

  const total = count ?? 0;
  return {
    listings: (data ?? []) as Listing[],
    total,
    page,
    per_page,
    total_pages: Math.ceil(total / per_page),
  };
}

/** Get distinct values for filter dropdowns. */
export async function getFilterOptions(): Promise<FilterOptions> {
  const [makes, states, damages, titles] = await Promise.all([
    supabase.from("listings").select("make").eq("is_active", true).not("make", "is", null).order("make"),
    supabase.from("listings").select("location_state").eq("is_active", true).not("location_state", "is", null).order("location_state"),
    supabase.from("listings").select("primary_damage").eq("is_active", true).not("primary_damage", "is", null).order("primary_damage"),
    supabase.from("listings").select("title_type").eq("is_active", true).not("title_type", "is", null).order("title_type"),
  ]);

  const unique = <T extends Record<string, unknown>>(rows: T[] | null, key: keyof T): string[] =>
    [...new Set((rows ?? []).map((r) => r[key] as string).filter(Boolean))];

  return {
    makes:       unique(makes.data, "make"),
    states:      unique(states.data, "location_state"),
    damage_types:unique(damages.data, "primary_damage"),
    title_types: unique(titles.data, "title_type"),
  };
}
