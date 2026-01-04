import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import CreateScrimForm from "./CreateScrimForm";
import { redirect } from "next/navigation";

type TeamJoinRow = {
  team_id: string;
  team: {
    name: string;
  }[];
};

export default async function NewScrimPage() {
  const supabase = await createServerSupabaseClient();

  // 🔐 Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 👥 Load managed teams
  const { data: teamRows, error } = await supabase
    .from("team_members")
    .select("team_id, team:teams(name)")
    .in("role", ["OWNER", "ADMIN"]);

  if (error) {
    return (
      <p className="text-red-500">Failed to load teams: {error.message}</p>
    );
  }

  const managedTeams = (teamRows as TeamJoinRow[]).map((t) => ({
    id: t.team_id,
    name: t.team[0]?.name ?? "Unknown team",
  }));

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Scrim</h1>
      <CreateScrimForm teams={managedTeams} />
    </div>
  );
}
