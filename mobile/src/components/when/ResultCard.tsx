import { StyleSheet, View } from 'react-native';
import { useElectricity } from '../../lib/electricity';
import { money, whenLabel, type Best, type Window } from '../../lib/shared';
import {
  SO_FAR_TEXT,
  noResultText,
  readyComparison,
  resultHeading,
  savingText,
  shareText,
  soonerText,
  standardTariffText,
  timerText,
  type Green,
} from '../../lib/when/view';
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

export interface ResultCardProps {
  result: Best | null;
  green: Green | null;
  kWh: number;
  perWeek: number;
  applianceName: string;
  finishBy: number | null;
  noTimer: boolean;
  pending: boolean;
  soFar: boolean;
  upAt: number | null;
  cheapestAny: Window | null;
}

/** The cheapest single run, with everything the website's Result shows. */
export function ResultCard({ result, green, kWh, perWeek, applianceName, finishBy, noTimer, pending, soFar, upAt, cheapestAny }: ResultCardProps) {
  const elec = useElectricity();
  const { colors } = useTheme();
  const { slots, tariff, refRate, now } = elec;

  if (!result) {
    return (
      <Section title="Result">
        <Callout icon="warning" iconColor="warn" tone="warn" accessibilityRole="alert">
          <T accessibilityLiveRegion="polite">{noResultText(upAt, finishBy)}</T>
        </Callout>
      </Section>
    );
  }

  const { best, now: nowWindow, sooner, alternatives, allSame } = result;
  const saveNow = nowWindow.cost - best.cost;
  const startNow = best.index === 0;
  const heading = resultHeading(result, soFar, upAt);
  const comparison = upAt ? readyComparison(best, cheapestAny) : null;
  const saving = savingText(saveNow, perWeek, !soFar, 'run');
  const standard = standardTariffText(kWh, refRate, tariff, best.cost);
  const timer = timerText(best, now);
  // On a flat tariff the greenest time is the useful one to remind about.
  const reminderWindow = allSame && green ? green.result.best : best;
  const showReminder = (!allSame || green) && reminderWindow.index !== 0 && !soFar;

  return (
    <Section title="Result">
      {pending ? <PricesPendingBanner /> : null}

      {allSame ? (
        <>
          <T variant="sectionHeader" color="textSecondary">
            On your tariff
          </T>
          <T variant="title2" accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>
            Any time costs the same
          </T>
          <T style={{ marginTop: 12 }}>
            Each run costs about <T style={styles.strong}>{money(best.cost)}</T>.
          </T>
          {perWeek > 0 ? (
            <T color="textSecondary" style={{ marginTop: 4 }}>
              That&apos;s about {money(best.cost * perWeek * 52)} a year at {perWeek} times a week.
            </T>
          ) : null}
          {tariff === 'flat' ? (
            <Callout tone="fill">
              <T variant="subhead" color="textSecondary">
                On a time-of-use tariff, such as Economy 7 or an EV tariff, running this overnight could cost less. Those tariffs need a smart meter, and your daytime rate is usually higher, so they suit households that can move a lot of their use to the cheap hours. The &quot;Should I switch?&quot; tool on cheapwatts.co.uk can check this against your own usage.
              </T>
            </Callout>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.eyebrow}>
            <Icon name="clock" size={16} color={soFar ? colors.warn : colors.good} />
            <T variant="sectionHeader" color={soFar ? 'warn' : 'good'}>
              {heading.eyebrow}
            </T>
          </View>
          <T variant="title2" accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>
            {heading.title}
          </T>
          <T color="textSecondary" style={{ marginTop: 4 }}>
            {heading.finish}
          </T>
          {comparison ? <T style={{ marginTop: 12 }}>{comparison}</T> : null}
          {soFar ? <T style={{ marginTop: 12 }}>{SO_FAR_TEXT}</T> : null}

          <CostTiles
            then={{ label: 'Cost then', value: money(best.cost), note: best.cost < 0 ? "Prices are below zero, so you'd be paid to use it." : undefined }}
            now={{ label: 'If you start it now', value: money(nowWindow.cost) }}
          />

          {saving ? (
            <View style={styles.saving}>
              <Icon name="piggy" size={20} color={colors.good} />
              <T style={{ flex: 1 }}>{saving}</T>
            </View>
          ) : null}
          {standard ? (
            <T variant="subhead" color="textSecondary" style={{ marginTop: 8 }}>
              {standard}
            </T>
          ) : null}

          {!startNow && !noTimer && !soFar ? (
            <Callout icon="timer" title="Using a delay timer?">
              <T>{timer.text}</T>
              {timer.over24h ? (
                <T variant="subhead" color="textSecondary">
                  Most delay timers only go up to 24 hours, so you may need to set it later on.
                </T>
              ) : null}
            </Callout>
          ) : null}

          {sooner ? (
            <Callout tone="fill" title="Can't wait that long?">
              <T>{soonerText(sooner)}</T>
            </Callout>
          ) : null}

          {alternatives.length > 0 ? (
            <View style={{ marginTop: 20 }}>
              <T variant="headline" accessibilityRole="header">
                Other good times
              </T>
              {alternatives.map((a) => (
                <View key={a.start} accessible accessibilityLabel={`${whenLabel(a.start)}, ${money(a.cost)}`} style={[styles.alt, { borderTopColor: colors.separator }]}>
                  <T style={{ flex: 1 }}>{whenLabel(a.start)}</T>
                  <T color="textSecondary" style={styles.tabular}>
                    {money(a.cost)}
                  </T>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}

      <ShareRow text={shareText(result, applianceName, perWeek)} />
      <Greenest green={green} cheapest={best} allSame={allSame} />
      {showReminder ? <Reminders start={reminderWindow.start} applianceName={applianceName} /> : null}

      {!allSame ? (
        <SlotChart
          slots={slots}
          title="Price per unit, every half hour"
          legend="Your cheapest window"
          highlights={[{ from: best.index, count: best.slotCount }]}
          refValue={tariff === 'flat' ? null : refRate}
          accessibilityLabel={`Bar chart of electricity price for each half hour, with the cheapest window highlighted: ${whenLabel(best.start)} to ${whenLabel(best.end)}, ${money(best.cost)}`}
        />
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { marginTop: 4 },
  strong: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  saving: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 16 },
  alt: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  tabular: { fontVariant: ['tabular-nums'] },
});
