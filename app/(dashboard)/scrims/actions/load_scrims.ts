"use server";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";

export type ScrimRow = {
  id: string;
  scheduled_at: string;
  region: string;
  tier_min: number;
  tier_max: number;
  creator_team: {
    id: string;
    name: string;
  } | null;
};

type LoadScrimsParams = {
  region?: string;
  tier?: number;
  cursor?: string; // ISO timestamp
  limit?: number;
};

// Hard limit to prevent abuse
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 10;

// Valid regions (adjust based on your game)
const VALID_REGIONS = [
  "NA",
  "EUW",
  "EUNE",
  "KR",
  "BR",
  "LAN",
  "LAS",
  "OCE",
  "TR",
  "RU",
  "JP",
];

// Internal type matching Supabase response
type SupabaseScrimRow = {
  id: string;
  scheduled_at: string;
  region: string;
  tier_min: number;
  tier_max: number;
  creator_team: {
    id: string;
    name: string;
  }[];
};

export async function loadScrims({
  region,
  tier,
  cursor,
  limit = DEFAULT_LIMIT,
}: LoadScrimsParams) {
  const supabase = await createServerSupabaseClient();

  // Validate and sanitize limit
  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

  // Validate region if provided
  if (region && !VALID_REGIONS.includes(region)) {
    throw new Error("Invalid region");
  }

  // Validate tier if provided (assuming tiers 1-10)
  if (tier !== undefined) {
    if (typeof tier !== "number" || isNaN(tier) || !Number.isFinite(tier)) {
      throw new Error("Invalid tier: must be a valid number");
    }
    if (tier < 1 || tier > 10) {
      throw new Error("Invalid tier: must be between 1 and 10");
    }
  }

  // Validate cursor format (should be ISO timestamp)
  if (cursor) {
    if (typeof cursor !== "string") {
      throw new Error("Invalid cursor: must be a string");
    }
    const parsedDate = Date.parse(cursor);
    if (isNaN(parsedDate)) {
      throw new Error("Invalid cursor: must be a valid ISO timestamp");
    }
  }

  let query = supabase
    .from("scrims")
    .select(
      `
      id,
      scheduled_at,
      region,
      tier_min,
      tier_max,
      creator_team:teams!scrims_creator_team_id_fkey (
        id,
        name
      )
    `
    )
    .eq("status", "OPEN")
    .order("scheduled_at", { ascending: true })
    .limit(safeLimit);

  if (region) {
    query = query.eq("region", region);
  }

  if (tier) {
    query = query.lte("tier_min", tier).gte("tier_max", tier);
  }

  if (cursor) {
    query = query.gt("scheduled_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Transform array to single object or null
  return (data as SupabaseScrimRow[]).map((scrim) => ({
    ...scrim,
    creator_team: scrim.creator_team[0] ?? null,
  })) as ScrimRow[];
}
