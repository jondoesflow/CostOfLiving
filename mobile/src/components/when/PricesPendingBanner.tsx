import { useElectricity } from '../../lib/electricity';
import { pendingText } from '../../lib/when/view';
import { T } from '../ui';
import { Callout } from './Callout';

// Dynamic tariffs publish the next day's prices in the afternoon, so before
// then we can only see up to about 11pm tonight.
export function PricesPendingBanner() {
  const { slots, tariff, tariffInfo } = useElectricity();
  if (!slots.length) return null;
  return (
    <Callout icon="hourglass" iconColor="warn" tone="warn" title="Tomorrow's prices aren't out yet" accessibilityRole="summary">
      <T>{pendingText(tariffInfo, tariff, slots)}</T>
    </Callout>
  );
}
