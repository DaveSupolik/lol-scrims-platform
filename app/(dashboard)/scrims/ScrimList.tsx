"use client";

import { useEffect, useState } from "react";
import { loadScrims, ScrimRow } from "./actions/load_scrims";
import { RegionFilter } from "./components/RegionFilter";
import { TierFilter } from "./components/TierFilter";
import { ScrimCard } from "./ScrimCard";

export default function ScrimList() {
  const [scrims, setScrims] = useState<ScrimRow[]>([]);
  const [region, setRegion] = useState<string>();
  const [tier, setTier] = useState<number>();
  const [cursor, setCursor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function loadMore(reset = false) {
    if (loading) return;
    setLoading(true);

    const data = await loadScrims({
      region,
      tier,
      cursor: reset ? undefined : cursor,
    });

    setScrims((prev) => (reset ? data : [...prev, ...data]));
    setCursor(data.at(-1)?.scheduled_at);
    setHasMore(data.length > 0);
    setLoading(false);
  }

  useEffect(() => {
    loadMore(true);
  }, [region, tier]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <RegionFilter value={region} onChange={setRegion} />
        <TierFilter value={tier} onChange={setTier} />
      </div>

      {/* Scrims */}
      <div className="space-y-3">
        {scrims.map((scrim) => (
          <ScrimCard key={scrim.id} scrim={scrim} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => loadMore()}
          disabled={loading}
          className="w-full border py-2 rounded"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
