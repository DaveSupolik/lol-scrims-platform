"use client";

import { useState } from "react";
import { createScrimAction } from "@/app/actions/create_scrim";

type Team = {
  id: string;
  name: string;
};

const RANKS = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Grandmaster",
  "Challenger",
];

export default function CreateScrimForm({ teams }: { teams: Team[] }) {
  const [teamId, setTeamId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [region, setRegion] = useState("EUW");
  const [tierMin, setTierMin] = useState(RANKS[0]);
  const [tierMax, setTierMax] = useState(RANKS[RANKS.length - 1]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // convert rank names to numbers or IDs if your DB expects integers
      const tierMinIndex = RANKS.indexOf(tierMin) + 1; // Iron = 1, Challenger = 9
      const tierMaxIndex = RANKS.indexOf(tierMax) + 1;

      if (tierMinIndex > tierMaxIndex) {
        throw new Error("Minimum tier cannot be higher than maximum tier");
      }

      await createScrimAction(
        teamId,
        scheduledAt,
        region,
        tierMinIndex,
        tierMaxIndex,
        notes
      );

      // redirect or simple success
      window.location.href = "/scrims";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Team */}
      <div>
        <label className="block text-sm font-medium">Team</label>
        <select
          required
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">Select team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Scheduled at */}
      <div>
        <label className="block text-sm font-medium">Scheduled at</label>
        <input
          type="datetime-local"
          required
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Region */}
      <div>
        <label className="block text-sm font-medium">Region</label>
        <select
          name="region"
          onChange={(e) => setRegion(e.target.value)}
          value={region}
          required
          className="w-full border rounded p-2"
        >
          <option value="EUW">EUW</option>
          <option value="EUNE">EUNE</option>
        </select>
      </div>

      {/* Tier Min / Max */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Minimum Tier</label>
          <select
            value={tierMin}
            onChange={(e) => setTierMin(e.target.value)}
            required
            className="w-full border rounded p-2"
          >
            {RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Maximum Tier</label>
          <select
            value={tierMax}
            onChange={(e) => setTierMax(e.target.value)}
            required
            className="w-full border rounded p-2"
          >
            {RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create scrim"}
      </button>
    </form>
  );
}
