import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus, SchedulableTriggerInputTypes, type NotificationPermissionsStatus } from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from './view';

// Local notifications when each job in the plan should start. The app's stand-in for the
// website's "Add the plan to my calendar" (.ics download).

export type ReminderResult = 'set' | 'denied' | 'nothing';

const CHANNEL_ID = 'plan';
let handlerSet = false;

/** Asks for permission (only when tapped) and schedules a notification at each start time. */
export async function scheduleReminders(reminders: Reminder[]): Promise<ReminderResult> {
  if (!reminders.length) return 'nothing';
  if (Platform.OS === 'android') {
    // Android 13+ only shows the permission prompt once a channel exists.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Plan reminders',
      importance: AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const settings = allowed(current) ? current : await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true } });
  if (!allowed(settings)) return 'denied';
  if (!handlerSet) {
    // So a reminder still shows if the app happens to be open at the time.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    handlerSet = true;
  }
  await Promise.all(
    reminders.map((r) =>
      Notifications.scheduleNotificationAsync({
        content: { title: r.title, body: r.body },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: r.at, channelId: CHANNEL_ID },
      }),
    ),
  );
  return 'set';
}

function allowed(s: NotificationPermissionsStatus): boolean {
  return s.granted || s.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}
