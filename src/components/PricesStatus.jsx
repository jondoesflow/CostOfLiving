import { Card, Warning } from "./ui";

// What to show in place of results while prices aren't available yet.
// Returns null once the tool can go ahead.
export default function PricesStatus({ elec, waiting = true }) {
  if (!waiting) return null;
  if (!elec.supplier) return <Card><p className="text-gray-700">Choose your supplier in step 1 to see prices.</p></Card>;
  if (elec.tariff !== "e7" && !elec.region) return <Card><p className="text-gray-700">Choose your region in step 1 to see prices.</p></Card>;
  if (elec.loading) return <Card><p className="text-gray-600">Getting today's prices…</p></Card>;
  if (elec.error) {
    return (
      <Card>
        <Warning><p>We couldn't get your supplier's prices just now. Check your connection and try again in a minute.</p></Warning>
      </Card>
    );
  }
  return null;
}
