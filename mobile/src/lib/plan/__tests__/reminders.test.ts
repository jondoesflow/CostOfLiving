import * as Notifications from 'expo-notifications';
import { scheduleReminders } from '../reminders';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  AndroidImportance: { HIGH: 4 },
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
}));

const mocked = Notifications as jest.Mocked<typeof Notifications>;
const perm = (granted: boolean) => ({ granted, status: granted ? 'granted' : 'denied', canAskAgain: true, expires: 'never' }) as Notifications.NotificationPermissionsStatus;
const reminders = [
  { id: 'washer', title: 'Start the washing machine', body: 'Part of your Cheap Watts plan', at: 1_800_000_000_000 },
  { id: 'dryer', title: 'Start the tumble dryer', body: 'Part of your Cheap Watts plan', at: 1_800_003_600_000 },
];

beforeEach(() => jest.clearAllMocks());

test('asks for permission only when needed and schedules one DATE notification per job', async () => {
  mocked.getPermissionsAsync.mockResolvedValue(perm(false));
  mocked.requestPermissionsAsync.mockResolvedValue(perm(true));
  await expect(scheduleReminders(reminders)).resolves.toBe('set');
  expect(mocked.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  expect(mocked.scheduleNotificationAsync).toHaveBeenCalledWith({
    content: { title: 'Start the washing machine', body: 'Part of your Cheap Watts plan' },
    trigger: { type: 'date', date: 1_800_000_000_000, channelId: 'plan' },
  });
});

test('does not prompt again once allowed', async () => {
  mocked.getPermissionsAsync.mockResolvedValue(perm(true));
  await expect(scheduleReminders(reminders)).resolves.toBe('set');
  expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
});

test('reports a refusal without scheduling anything', async () => {
  mocked.getPermissionsAsync.mockResolvedValue(perm(false));
  mocked.requestPermissionsAsync.mockResolvedValue(perm(false));
  await expect(scheduleReminders(reminders)).resolves.toBe('denied');
  expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('nothing to remind about means no prompt', async () => {
  await expect(scheduleReminders([])).resolves.toBe('nothing');
  expect(mocked.getPermissionsAsync).not.toHaveBeenCalled();
});
