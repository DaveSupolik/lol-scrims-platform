"use client";

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

type Props = {
  value?: number;
  onChange: (value?: number) => void;
};

export function TierFilter({ value, onChange }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value ? Number(e.target.value) : undefined)
      }
      className="border rounded px-3 py-2"
    >
      <option value="">All tiers</option>
      {RANKS.map((rank, index) => (
        <option key={rank} value={index + 1}>
          {rank}
        </option>
      ))}
    </select>
  );
}
