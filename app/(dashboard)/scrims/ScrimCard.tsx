import { tierRangeLabel } from "@/app/lib/tier";
import type { ScrimRow } from "./actions/load_scrims";

export function ScrimCard({ scrim }: { scrim: ScrimRow }) {
  return (
    <div className="border rounded p-4 space-y-1">
      <div className="font-semibold">
        {scrim.creator_team[0]?.name ?? "Unknown team"}
      </div>

      <div className="text-sm text-gray-600">
        {scrim.region} · {tierRangeLabel(scrim.tier_min, scrim.tier_max)}
      </div>

      <div className="text-sm">
        {new Date(scrim.scheduled_at).toLocaleString()}
      </div>
    </div>
  );
}
