import { SUPPLIERS, tariffsFor } from '../../lib/shared';
import { Section } from '../ui';
import { ChoiceRow } from './ChoiceRow';

export function TariffSection({ supplier, tariff, onChoose }: { supplier: string; tariff: string; onChoose: (id: string) => void }) {
  const supplierInfo = SUPPLIERS.find((s) => s.id === supplier);
  if (!supplierInfo) return null;
  // Same words as the website's TariffStep legend.
  const legend = supplierInfo.api
    ? "Which tariff are you on? It's on your bill or in your supplier's app."
    : `We can't get live prices from ${supplier === 'other' ? 'your supplier' : supplierInfo.name} yet. If you have cheaper hours (Economy 7, an EV tariff or similar), choose the off-peak option and copy the times and rates from your bill.`;
  return (
    <Section title="Your tariff" flush footer={legend}>
      {tariffsFor(supplier).map((t, i) => (
        <ChoiceRow key={t.id} first={i === 0} title={t.label} subtitle={t.blurb} checked={t.id === tariff} onPress={() => onChoose(t.id)} />
      ))}
    </Section>
  );
}
