import ScrimList from "./ScrimList";

export default function ScrimsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Public Scrims</h1>
      <ScrimList />
    </div>
  );
}
