import { SUPPLIERS } from '../../lib/shared';
import { Section } from '../ui';
import { ChoiceRow } from './ChoiceRow';

export function SupplierSection({ supplier, onChoose }: { supplier: string; onChoose: (id: string) => void }) {
  return (
    <Section title="Who supplies your electricity?" flush>
      {SUPPLIERS.map((s, i) => (
        <ChoiceRow key={s.id} first={i === 0} title={s.name} checked={s.id === supplier} onPress={() => onChoose(s.id)} />
      ))}
    </Section>
  );
}
