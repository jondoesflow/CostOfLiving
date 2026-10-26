import { APPLIANCES, bestWindows, economy7Slots, money, profileOf, whenLabel } from '../shared';

// The maths and figures come from the website's own code, so one check that they load and
// behave the same here as there.
const E7 = { nightStart: '02:00', nightEnd: '05:00', dayRate: 28, nightRate: 7 };

test('shares the website maths: a washing machine heats first, so it can start late in the cheap hours', () => {
  const start = Date.UTC(2026, 9, 23, 20, 0); // 9pm BST
  const slots = economy7Slots(E7, start);
  const washer = APPLIANCES.find((a) => a.id === 'washer')!;
  const profile = profileOf('washer');
  const cheapest = bestWindows(slots, washer.kWh, washer.mins, null, { profile })!;
  expect(money(cheapest.best.cost)).toBe('5.6p');
  // Ready when I'm up at 7am, waiting no more than an hour: start 4am, 7.7p.
  const up = Date.UTC(2026, 9, 24, 6, 0);
  const ready = bestWindows(slots, washer.kWh, washer.mins, up, { notBefore: up - 3600000, profile })!;
  expect(money(ready.best.cost)).toBe('7.7p');
  expect(whenLabel(ready.best.start)).toMatch(/^4am/);
});
