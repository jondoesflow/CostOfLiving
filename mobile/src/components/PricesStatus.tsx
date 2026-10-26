import { router } from 'expo-router';
import { Button, EmptyState, ErrorState, LoadingState } from './ui';
import { useElectricity } from '../lib/electricity';

// What to show in place of results while prices aren't available yet. Returns null once the
// tool can go ahead. Mirrors the website's PricesStatus.
export function PricesStatus({ waiting = true }: { waiting?: boolean }) {
  const elec = useElectricity();
  if (!waiting) return null;
  if (!elec.restored) return <LoadingState label="Loading your settings…" />;
  if (!elec.configured) {
    return (
      <EmptyState
        icon="bolt"
        title="Set up your tariff first"
        message="Tell us who supplies your electricity and which tariff you're on, so we can look up your prices."
        action={<Button title="Set up my tariff" onPress={() => router.navigate('/settings')} />}
      />
    );
  }
  if (elec.error) return <ErrorState message="We couldn't get your supplier's prices just now. Check your connection and try again." onRetry={elec.reload} />;
  if (elec.loading || !elec.ready) return <LoadingState label="Getting today's prices…" />;
  return null;
}
