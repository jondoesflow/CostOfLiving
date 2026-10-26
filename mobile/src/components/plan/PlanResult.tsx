import { useEffect, useState } from 'react';
import { Linking, Share, StyleSheet, Text, View } from 'react-native';
import { scheduleReminders, type ReminderResult } from '../../lib/plan/reminders';
import {
  ALL_SAME_LINE,
  SHARE_URL,
  missingText,
  nowText,
  reminderPlan,
  savingLine,
  shareText,
  summaryText,
  timelineGeometry,
  totalLine,
  whenText,
  type Plan,
} from '../../lib/plan/view';
import { money, type Slot } from '../../lib/shared';
import { isIOS, type, useTheme } from '../../theme';
import { Icon } from '../Icon';
import { Button, Price, Row, Section, T } from '../ui';
import { Timeline } from './Timeline';

type ReminderState = 'idle' | 'busy' | ReminderResult;

/** "Your plan": the total, the saving, the list, the timeline, reminders and sharing. */
export function PlanResult({ plan, slots, now }: { plan: Plan; slots: Slot[]; now: number }) {
  const { colors } = useTheme();
  const [reminders, setReminders] = useState<ReminderState>('idle');
  // A changed plan needs fresh reminders.
  const signature = plan.scheduled.map((p) => `${p.job.id}@${p.window.start}`).join('|');
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReminders('idle');
  }, [signature]);

  const saving = savingLine(plan);
  const missing = missingText(plan);
  const toRemind = reminderPlan(plan, now);

  async function remind() {
    setReminders('busy');
    try {
      setReminders(await scheduleReminders(toRemind));
    } catch {
      setReminders('idle');
    }
  }

  async function share() {
    const text = shareText(plan);
    try {
      await Share.share(isIOS ? { title: 'Cheap Watts', message: text, url: SHARE_URL } : { title: 'Cheap Watts', message: `${text} ${SHARE_URL}` });
    } catch {
      // They closed the share sheet, or there is nowhere to share to.
    }
  }

  return (
    <Section>
      <T variant="sectionHeader" color="good" style={{ fontWeight: '600' }}>
        Your plan
      </T>
      <Text
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
        accessibilityLabel={summaryText(plan)}
        style={[type.title2, { color: colors.text, marginTop: 4, fontVariant: ['tabular-nums'] }]}
      >
        {totalLine(plan)}
      </Text>
      {plan.allSame ? (
        <T color="textSecondary" style={{ marginTop: 4 }}>
          {ALL_SAME_LINE}
        </T>
      ) : saving ? (
        <View style={styles.saving}>
          <Icon name="piggy" size={20} color={colors.good} />
          <T style={{ flex: 1 }}>
            Starting everything now would cost about <Text style={styles.strong}>{saving.nowCost}</Text>, so this plan saves{' '}
            <Text style={styles.strong}>{saving.saving}</Text>.
          </T>
        </View>
      ) : null}

      {!plan.allSame ? (
        <>
          <View style={{ marginTop: 12, marginHorizontal: -16 }}>
            {plan.scheduled.map((p, i) => {
              const extra = nowText(p);
              return (
                <Row
                  key={p.job.id}
                  first={i === 0}
                  title={p.job.name}
                  subtitle={whenText(p)}
                  accessibilityLabel={`${p.job.name}. ${whenText(p)}. ${money(p.window.cost)}${extra ? `, ${extra}` : ''}`}
                  trailing={
                    <View style={{ alignItems: 'flex-end' }}>
                      <Price pence={money(p.window.cost)} />
                      {extra ? (
                        <T variant="caption" color="textSecondary">
                          {extra}
                        </T>
                      ) : null}
                    </View>
                  }
                />
              );
            })}
          </View>
          <Timeline geometry={timelineGeometry(plan, slots)} />

          <View style={{ marginTop: 16, gap: 8 }}>
            {reminders === 'set' ? (
              <View style={styles.status} accessibilityLiveRegion="polite">
                <Icon name="bellOn" size={18} color={colors.good} />
                <T color="good">Reminders set</T>
              </View>
            ) : reminders === 'denied' ? (
              <View accessibilityLiveRegion="polite" style={{ gap: 8 }}>
                <T variant="subhead" color="textSecondary">
                  Notifications are turned off for Cheap Watts. Turn them on in Settings to get a reminder when each one should start.
                </T>
                <Button title="Open Settings" variant="tonal" icon="settings" onPress={() => Linking.openSettings()} />
              </View>
            ) : toRemind.length > 0 ? (
              <Button
                title="Remind me when each starts"
                icon="bell"
                loading={reminders === 'busy'}
                onPress={remind}
                accessibilityHint="Sets a notification at each start time"
              />
            ) : null}
            <Button title="Share this" variant="tonal" icon="share" onPress={share} />
          </View>
        </>
      ) : null}

      {missing ? (
        <View style={[styles.warning, { backgroundColor: colors.warnContainer }]} accessibilityRole="alert">
          <Icon name="warning" size={20} color={colors.warn} />
          <T variant="subhead" color="warn" style={{ flex: 1 }}>
            {missing}
          </T>
        </View>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  saving: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 12 },
  strong: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  status: { flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 44 },
  warning: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 16, padding: 12, borderRadius: 8 },
});
