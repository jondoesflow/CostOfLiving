import * as Notifications from 'expo-notifications';
import { IosAuthorizationStatus, type NotificationPermissionsStatus } from 'expo-notifications';
import { reminderTitle } from './view';

// Local notifications in place of the website's calendar links: one reminder at the start of
// the cheapest window. Nothing leaves the phone.

export const REMINDER_BODY = 'Cheapest time on your tariff, from Cheap Watts';

let handlerSet = false;

/** Show reminders as banners even while the app is open. Safe to call more than once. */
export function installNotificationHandler(): void {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export type ReminderOutcome =
  | { ok: true; id: string; at: number }
  | { ok: false; reason: 'denied' | 'past' | 'failed' };

/** Permission is granted on Android by the root status; on iOS the granular status is the one to trust. */
export function permissionGranted(p: NotificationPermissionsStatus): boolean {
  if (p.ios) {
    return (
      p.ios.status === IosAuthorizationStatus.AUTHORIZED ||
      p.ios.status === IosAuthorizationStatus.PROVISIONAL ||
      p.ios.status === IosAuthorizationStatus.EPHEMERAL
    );
  }
  return p.granted || p.status === 'granted';
}

/** Ask for permission (only when the user taps) and schedule a reminder at `start`. */
export async function scheduleReminder({ start, applianceName, now = Date.now() }: { start: number; applianceName: string; now?: number }): Promise<ReminderOutcome> {
  if (start <= now) return { ok: false, reason: 'past' };
  try {
    installNotificationHandler();
    const existing = await Notifications.getPermissionsAsync();
    const permission = permissionGranted(existing) ? existing : await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
    if (!permissionGranted(permission)) return { ok: false, reason: 'denied' };
    const id = await Notifications.scheduleNotificationAsync({
      content: { title: reminderTitle(applianceName), body: REMINDER_BODY },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(start) },
    });
    return { ok: true, id, at: start };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

/** Take a reminder back, e.g. when the cheapest time changes. Errors are ignored. */
export async function cancelReminder(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already gone, or notifications unavailable; nothing to do.
  }
}
