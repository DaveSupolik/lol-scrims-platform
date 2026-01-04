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
  }[];
};

type LoadScrimsParams = {
  region?: string;
  tier?: number;
  cursor?: string; // ISO timestamp
  limit?: number;
};

export async function loadScrims({
  region,
  tier,
  cursor,
  limit = 10,
}: LoadScrimsParams) {
  const supabase = await createServerSupabaseClient();

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
    .limit(limit);

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

  return data as ScrimRow[];
}
