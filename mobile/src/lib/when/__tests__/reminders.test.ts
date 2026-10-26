import * as Notifications from 'expo-notifications';
import { REMINDER_BODY, cancelReminder, permissionGranted, scheduleReminder } from '../reminders';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  IosAuthorizationStatus: { NOT_DETERMINED: 0, DENIED: 1, AUTHORIZED: 2, PROVISIONAL: 3, EPHEMERAL: 4 },
}));

const mocked = Notifications as jest.Mocked<typeof Notifications>;
const NOW = Date.UTC(2026, 9, 23, 20, 0);
const granted = { status: 'granted', granted: true, canAskAgain: true, expires: 'never' } as Notifications.NotificationPermissionsStatus;
const denied = { status: 'denied', granted: false, canAskAgain: false, expires: 'never' } as Notifications.NotificationPermissionsStatus;

beforeEach(() => jest.clearAllMocks());

test('asks for permission only when it has not been granted, then schedules a dated reminder', async () => {
  mocked.getPermissionsAsync.mockResolvedValue(denied);
  mocked.requestPermissionsAsync.mockResolvedValue(granted);
  mocked.scheduleNotificationAsync.mockResolvedValue('abc');
  const start = NOW + 3 * 3600000;
  const out = await scheduleReminder({ start, applianceName: 'Washing machine', now: NOW });
  expect(out).toEqual({ ok: true, id: 'abc', at: start });
  expect(mocked.setNotificationHandler).toHaveBeenCalledTimes(1);
  expect(mocked.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(mocked.scheduleNotificationAsync).toHaveBeenCalledWith({
    content: { title: 'Start the washing machine', body: REMINDER_BODY },
    trigger: { type: 'date', date: new Date(start) },
  });
});

test('skips the prompt when permission is already there', async () => {
  mocked.getPermissionsAsync.mockResolvedValue(granted);
  mocked.scheduleNotificationAsync.mockResolvedValue('x');
  await scheduleReminder({ start: NOW + 60000, applianceName: 'Electric car', now: NOW });
  expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
  expect(mocked.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({ content: { title: 'Charge the electric car', body: REMINDER_BODY } }));
});

test('reports a refusal without scheduling', async () => {
  mocked.getPermissionsAsync.mockResolvedValue(denied);
  mocked.requestPermissionsAsync.mockResolvedValue(denied);
  const out = await scheduleReminder({ start: NOW + 60000, applianceName: 'Iron', now: NOW });
  expect(out).toEqual({ ok: false, reason: 'denied' });
  expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('will not schedule a reminder in the past', async () => {
  const out = await scheduleReminder({ start: NOW - 1, applianceName: 'Iron', now: NOW });
  expect(out).toEqual({ ok: false, reason: 'past' });
  expect(mocked.getPermissionsAsync).not.toHaveBeenCalled();
});

test('a failure to schedule is reported, not thrown', async () => {
  mocked.getPermissionsAsync.mockResolvedValue(granted);
  mocked.scheduleNotificationAsync.mockRejectedValue(new Error('no'));
  const out = await scheduleReminder({ start: NOW + 60000, applianceName: 'Iron', now: NOW });
  expect(out).toEqual({ ok: false, reason: 'failed' });
});

test('on iOS the granular status decides', () => {
  const ios = (status: number) => ({ ...granted, granted: false, status: 'undetermined', ios: { status } }) as unknown as Notifications.NotificationPermissionsStatus;
  expect(permissionGranted(ios(2))).toBe(true);
  expect(permissionGranted(ios(3))).toBe(true);
  expect(permissionGranted(ios(1))).toBe(false);
  expect(permissionGranted(granted)).toBe(true);
  expect(permissionGranted(denied)).toBe(false);
});

test('cancelling swallows errors', async () => {
  mocked.cancelScheduledNotificationAsync.mockRejectedValue(new Error('gone'));
  await expect(cancelReminder('abc')).resolves.toBeUndefined();
});
