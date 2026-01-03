"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function createScrimAction(
  teamId: string,
  scheduledAt: string,
  notes?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_scrim", {
    p_team_id: teamId,
    p_scheduled_at: scheduledAt,
    p_notes: notes ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data; // scrim_id
}
