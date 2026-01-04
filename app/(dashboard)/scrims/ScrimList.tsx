"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadScrims, ScrimRow } from "./actions/load_scrims";
import { RegionFilter } from "./components/RegionFilter";
import { TierFilter } from "./components/TierFilter";
import { ScrimCard } from "./ScrimCard";

export default function ScrimList() {
  const [scrims, setScrims] = useState<ScrimRow[]>([]);
  const [cursor, setCursor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read filters from URL
  const region = searchParams.get("region") ?? undefined;
  const tierParam = searchParams.get("tier");
  const tier = tierParam ? parseInt(tierParam) : undefined;

  const handleRegionChange = (newRegion?: string) => {
    const params = new URLSearchParams(searchParams);
    if (newRegion) {
      params.set("region", newRegion);
    } else {
      params.delete("region");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTierChange = (newTier?: number) => {
    const params = new URLSearchParams(searchParams);
    if (newTier !== undefined) {
      params.set("tier", newTier.toString());
    } else {
      params.delete("tier");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  async function loadMore(reset = false) {
    if (loading) return;
    setLoading(true);
    if (reset) {
      setScrims([]);
    }
    const limit = 10;
    const data = await loadScrims({
      region,
      tier,
      cursor: reset ? undefined : cursor,
      limit,
    });
    setScrims((prev) => (reset ? data : [...prev, ...data]));
    setCursor(data.at(-1)?.scheduled_at);
    setHasMore(data.length === limit);
    setLoading(false);
  }

  useEffect(() => {
    loadMore(true);
  }, [region, tier]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <RegionFilter value={region} onChange={handleRegionChange} />
        <TierFilter value={tier} onChange={handleTierChange} />
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
