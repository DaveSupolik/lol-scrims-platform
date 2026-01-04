export const TIERS = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Grandmaster",
  "Challenger",
] as const;

export function tierLabel(tier: number | null | undefined) {
  if (!tier) return "—";
  return TIERS[tier - 1] ?? "Unknown";
}

export function tierRangeLabel(min: number, max: number) {
  if (min === max) return tierLabel(min);
  return `${tierLabel(min)} – ${tierLabel(max)}`;
}
