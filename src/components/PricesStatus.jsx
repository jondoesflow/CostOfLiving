import { Card, Warning } from "./ui";

// What to show in place of results while prices aren't available yet.
// Returns null once the tool can go ahead.
export default function PricesStatus({ elec, waiting = true }) {
  if (!waiting) return null;
  const message = (text) => <Card><p className="text-gray-700" role="status">{text}</p></Card>;
  if (!elec.supplier) return message("Choose your supplier in step 1 to see prices.");
  if (elec.tariff !== "e7" && !elec.region) return message("Choose your region in step 1 to see prices.");
  if (elec.loading) return message("Getting today's prices…");
  if (elec.error) {
    return (
      <Card>
        <Warning><p>We couldn't get your supplier's prices just now. Check your connection and try again in a minute.</p></Warning>
      </Card>
    );
  }
  return null;
}
