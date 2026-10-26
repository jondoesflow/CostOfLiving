import { StyleSheet, View } from 'react-native';
import { useElectricity } from '../../lib/electricity';
import { money, whenLabel, type ChargePlan } from '../../lib/shared';
import { chargeAppText, chargeHeading, chargePartialText, chargeSessionLabel, chargeShareText, kwhLabel, savingText, type Green } from '../../lib/when/view';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';
import { Section, T } from '../ui';
import { Callout } from './Callout';
import { CostTiles } from './CostTiles';
import { Greenest } from './Greenest';
import { PricesPendingBanner } from './PricesPendingBanner';
import { Reminders } from './Reminders';
import { ShareRow } from './ShareRow';
import { SlotChart } from './SlotChart';

export interface ChargeResultCardProps {
  plan: ChargePlan;
  green: Green | null;
  kWh: number;
  perWeek: number;
  applianceName: string;
  finishBy: number | null;
  pending: boolean;
}

/** Car charging split across the cheapest half hours. */
export function ChargeResultCard({ plan, green, kWh, perWeek, applianceName, finishBy, pending }: ChargeResultCardProps) {
  const { slots, tariff, refRate, now } = useElectricity();
  const { colors } = useTheme();
  const { sessions, cost, nowCost, placed, remaining, startsNow } = plan;
  const first = sessions[0];
  const done = sessions[sessions.length - 1].end;
  const partial = remaining > 0.05;
  const heading = chargeHeading(plan);
  const partialText = chargePartialText(plan, kWh, pending, finishBy);
  const saving = savingText(nowCost - cost, perWeek, !partial, 'charge');

  return (
    <Section title="Result">
      {pending ? <PricesPendingBanner /> : null}
      <View style={styles.eyebrow}>
        <Icon name="clock" size={16} color={colors.good} />
        <T variant="sectionHeader" color="good">
          Cheapest half hours
        </T>
      </View>
      <T variant="title2" accessibilityRole="header" accessibilityLiveRegion="polite" style={{ marginTop: 4 }}>
        {heading.title}
      </T>
      <T color="textSecondary" style={{ marginTop: 4 }}>
        {heading.finish}
      </T>
      {partialText ? <T style={{ marginTop: 12 }}>{partialText}</T> : null}

      <CostTiles then={{ label: partial ? `Cost then for ${kwhLabel(placed)}` : 'Cost then', value: money(cost) }} now={{ label: 'If you charge straight away', value: money(nowCost) }} />

      {saving ? (
        <View style={styles.saving}>
          <Icon name="piggy" size={20} color={colors.good} />
          <T style={{ flex: 1 }}>{saving}</T>
        </View>
      ) : null}

      <View style={{ marginTop: 20 }}>
        <T variant="headline" accessibilityRole="header">
          When to charge
        </T>
        {sessions.map((s) => {
          const label = chargeSessionLabel(s);
          return (
            <View key={s.start} accessible accessibilityLabel={`${label.when}: ${label.amount}`} style={[styles.session, { borderTopColor: colors.separator }]}>
              <T style={{ flex: 1 }}>{label.when}</T>
              <T color="textSecondary" style={styles.tabular}>
                {label.amount}
              </T>
            </View>
          );
        })}
      </View>

      <Callout icon="Car" title="It doesn't need to charge in one go">
        <T>{chargeAppText(plan, now)}</T>
      </Callout>

      <ShareRow text={chargeShareText(plan, perWeek)} />
      <Greenest green={green} cheapest={null} allSame={false} />
      {!startsNow ? <Reminders start={first.start} applianceName={applianceName} /> : null}

      <SlotChart
        slots={slots}
        title="Price per unit, every half hour"
        legend="Cheapest half hours"
        highlights={sessions.map((s) => ({ from: s.index, count: s.count }))}
        refValue={tariff === 'flat' ? null : refRate}
        accessibilityLabel={`Bar chart of electricity price for each half hour, with the cheapest half hours for charging highlighted: ${sessions.length} ${sessions.length === 1 ? 'spell' : 'spells'} from ${whenLabel(first.start)} to ${whenLabel(done)}, ${money(cost)}`}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saving: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 16 },
  session: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  tabular: { fontVariant: ['tabular-nums'], textAlign: 'right', flexShrink: 1 },
});
