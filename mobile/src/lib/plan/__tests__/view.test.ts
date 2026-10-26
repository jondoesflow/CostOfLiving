import { economy7Slots } from '../../shared';
import {
  SHARE_URL,
  activeFinishBy,
  buildJobs,
  finishOptions,
  hoursFor,
  makePlan,
  maxAtOnceFor,
  minsFor,
  missingText,
  reminderPlan,
  savingLine,
  shareText,
  summaryText,
  timelineGeometry,
  whenText,
} from '../view';

const E7 = { nightStart: '02:00', nightEnd: '05:00', dayRate: 28, nightRate: 7 };
const NOW = Date.UTC(2026, 9, 23, 20, 0); // 9pm BST
const slots = economy7Slots(E7, NOW);

const jobs = buildJobs(['washer', 'dryer'], {});

test('buildJobs pre-fills the website figures and drops empty ones', () => {
  expect(jobs.map((j) => [j.name, j.kWh, j.mins])).toEqual([
    ['Washing machine', 0.8, 120],
    ['Tumble dryer', 4, 120],
  ]);
  expect(jobs[0].profile).not.toBeNull();
  expect(buildJobs(['washer'], { washer: { kWh: null, mins: 120 } })).toEqual([]);
  expect(hoursFor(90)).toBe(1.5);
  expect(minsFor(1.25)).toBe(75);
});

test('one at a time: two jobs never overlap', () => {
  const plan = makePlan(slots, jobs, maxAtOnceFor('1'), null)!;
  expect(plan.scheduled).toHaveLength(2);
  const [a, b] = plan.scheduled;
  expect(a.window.end <= b.window.start || b.window.end <= a.window.start).toBe(true);
  // Both sit in the cheap hours, so one finishes as the other starts.
  expect(b.window.start).toBe(a.window.end);
});

test('up to 2 at once lets both run together in the cheap hours', () => {
  const plan = makePlan(slots, jobs, maxAtOnceFor('2'), null)!;
  const [a, b] = plan.scheduled;
  expect(a.window.start).toBe(b.window.start);
  expect(plan.saving).toBeGreaterThan(0);
  expect(savingLine(plan)).toEqual({ nowCost: '£1.34', saving: '£1.01' });
  expect(shareText(plan)).toBe('I fitted 2 jobs into the cheap hours and saved £1.01 on running them all now. Plan yours, free:');
  // Biggest user first; the day word depends on the real clock, so match the time only.
  expect(summaryText(plan)).toMatch(/^Plan ready: 34p for everything\. Tumble dryer at 2am \w+, Washing machine at 2am \w+\.$/);
  expect(whenText(a)).toMatch(/^Start 2am \w+, done by 4am$/);
});

test('finish-by rules out the cheap hours and the plan reports what would not fit', () => {
  const options = finishOptions(slots, jobs, NOW);
  // Whole hours only, no sooner than the longest job could finish.
  expect(options.every((t) => t % 3600000 === 0)).toBe(true);
  expect(options[0]).toBe(NOW + 2 * 3600000);
  expect(activeFinishBy(NOW + 1, options)).toBeNull();
  expect(activeFinishBy(options[0], options)).toBe(options[0]);

  // Everything done by 11pm: both must start now, so there is nothing to save.
  const byEleven = makePlan(slots, jobs, Infinity, options[0])!;
  expect(byEleven.scheduled.every((p) => p.window.end <= options[0])).toBe(true);
  expect(byEleven.scheduled.every((p) => p.window.index === 0)).toBe(true);
  expect(savingLine(byEleven)).toBeNull();
  expect(shareText(byEleven)).toBe('Fit your washing, dishwasher and car charging into the cheapest hours, free:');

  // One at a time by 11pm: only one fits.
  const oneByEleven = makePlan(slots, jobs, 1, options[0])!;
  expect(oneByEleven.scheduled).toHaveLength(1);
  expect(missingText(oneByEleven)).toBe("Couldn't fit washing machine in before your finish time. Try a later finish time or allow more at once.");
  expect(missingText(byEleven)).toBeNull();
});

test('a flat tariff is reported as all the same', () => {
  const flat = economy7Slots({ ...E7, nightRate: 28 }, NOW);
  const plan = makePlan(flat, jobs, 2, null)!;
  expect(plan.allSame).toBe(true);
  expect(summaryText(plan)).toBe('Your tariff costs the same at any time. Everything together costs about £1.34.');
  expect(savingLine(plan)).toBeNull();
});

test('timeline geometry is in fractions with a tick every six hours', () => {
  const plan = makePlan(slots, jobs, 2, null)!;
  const g = timelineGeometry(plan, slots);
  expect(g.from).toBe(slots[0].start);
  expect(g.to).toBe(plan.lastEnd);
  for (const b of g.bars) {
    expect(b.left).toBeGreaterThanOrEqual(0);
    expect(b.left + b.width).toBeLessThanOrEqual(1 + 1e-9);
  }
  // 9pm to 4am: midnight is the only six-hour mark.
  expect(g.ticks.map((t) => t.label)).toEqual(['12am']);
  expect(g.ticks[0].left).toBeCloseTo(3 / 7);
  // A short plan still spans at least six hours.
  const short = makePlan(slots, buildJobs(['iron'], {}), 2, NOW + 3600000)!;
  expect(timelineGeometry(short, slots).to).toBe(slots[0].start + 6 * 3600000);
});

test('reminders are planned for every job that has not started yet', () => {
  const plan = makePlan(slots, jobs, 2, null)!;
  expect(reminderPlan(plan, NOW)).toEqual([
    { id: 'dryer', title: 'Start the tumble dryer', body: 'Part of your Cheap Watts plan', at: plan.scheduled[0].window.start },
    { id: 'washer', title: 'Start the washing machine', body: 'Part of your Cheap Watts plan', at: plan.scheduled[1].window.start },
  ]);
  const now = makePlan(slots, jobs, 2, finishOptions(slots, jobs, NOW)[0])!;
  expect(reminderPlan(now, NOW)).toEqual([]);
  expect(SHARE_URL).toBe('https://cheapwatts.co.uk/plan-my-evening/?utm_source=app&utm_medium=share&utm_campaign=plan');
});
