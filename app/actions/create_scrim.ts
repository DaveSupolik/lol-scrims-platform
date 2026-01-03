"use server";

import { createServerSupabaseClient } from "@/app/lib/supabase/server";

function mapScrimError(message: string) {
  if (message.includes("Authentication")) return "You must be logged in";
  if (message.includes("Not authorized")) return "You don’t have permission";
  if (message.includes("future"))
    return "Scrim must be scheduled in the future";
  return "Failed to create scrim";
}

export async function createScrimAction(
  teamId: string,
  scheduledAt: string,
  notes?: string
): Promise<string> {
  if (!teamId || !scheduledAt) {
    throw new Error("Invalid input");
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("create_scrim", {
    p_team_id: teamId,
    p_scheduled_at: scheduledAt,
    p_notes: notes ?? null,
  });

  if (error) {
    throw new Error(mapScrimError(error.message));
  }

  return data;
}
