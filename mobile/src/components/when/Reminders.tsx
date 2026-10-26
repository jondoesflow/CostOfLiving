import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { whenLabel } from '../../lib/shared';
import { cancelReminder, scheduleReminder, type ReminderOutcome } from '../../lib/when/reminders';
import { Button, T } from '../ui';
import { Callout } from './Callout';

/**
 * "Remind me": a local notification at the start of the window, in place of the website's
 * calendar links. The reminder is cleared if the start time changes, so it never fires for a
 * time that's no longer the cheapest.
 */
export function Reminders({ start, applianceName }: { start: number; applianceName: string }) {
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<ReminderOutcome | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOutcome((o) => {
      if (o?.ok && o.at !== start) {
        void cancelReminder(o.id);
        return null;
      }
      return o;
    });
  }, [start]);

  async function remind() {
    setBusy(true);
    const out = await scheduleReminder({ start, applianceName });
    setOutcome(out);
    setBusy(false);
  }

  const set = outcome?.ok === true;
  return (
    <Callout icon={set ? 'bellOn' : 'bell'} title="Remind me">
      <T>Get a notification on this phone at the start time.</T>
      <View accessibilityLiveRegion="polite">
        {set ? <T color="good">Reminder set for {whenLabel(outcome.at)}.</T> : null}
        {outcome?.ok === false && outcome.reason === 'denied' ? (
          <T color="textSecondary">Notifications are turned off for Cheap Watts. Turn them on in Settings to get a reminder.</T>
        ) : null}
        {outcome?.ok === false && outcome.reason === 'failed' ? <T color="textSecondary">The reminder couldn&apos;t be set. Try again in a moment.</T> : null}
        {outcome?.ok === false && outcome.reason === 'past' ? <T color="textSecondary">That time has already passed.</T> : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {!set ? <Button title={outcome?.ok === false ? 'Try again' : 'Remind me'} loading={busy} onPress={remind} accessibilityHint="Sets a notification for the start time" /> : null}
        {outcome?.ok === false && outcome.reason === 'denied' ? (
          <Button title="Open Settings" variant="tonal" onPress={() => void Linking.openSettings()} accessibilityHint="Opens this app's settings" />
        ) : null}
      </View>
    </Callout>
  );
}
