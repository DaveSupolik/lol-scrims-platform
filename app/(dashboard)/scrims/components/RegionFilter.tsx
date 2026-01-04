"use client";

type Props = {
  value?: string;
  onChange: (value?: string) => void;
};

export function RegionFilter({ value, onChange }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      className="border rounded px-3 py-2"
    >
      <option value="">All regions</option>
      <option value="EUW">EUW</option>
      <option value="EUNE">EUNE</option>
    </select>
  );
}
