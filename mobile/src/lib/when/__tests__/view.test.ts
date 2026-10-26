import { APPLIANCES, TARIFFS, economy7Slots, money, whenLabel, type Slot } from '../../shared';
import {
  chargeShareText,
  chartBars,
  chartTicks,
  finishOptions,
  grams,
  greenestText,
  noResultText,
  readyComparison,
  reminderTitle,
  resultHeading,
  savingText,
  shareMessage,
  shareText,
  standardTariffText,
  summaryText,
  whenModel,
} from '../view';

// The same Economy 7 fixture as src/lib/__tests__/shared.test.ts: cheap from 2am to 5am.
const E7 = { nightStart: '02:00', nightEnd: '05:00', dayRate: 28, nightRate: 7 };
const NOW = Date.UTC(2026, 9, 23, 20, 0); // 9pm BST
const slots = economy7Slots(E7, NOW);
const washer = APPLIANCES.find((a) => a.id === 'washer')!;
const e7Tariff = TARIFFS.find((t) => t.id === 'e7');

const base = {
  applianceId: 'washer',
  kWh: washer.kWh,
  mins: washer.mins,
  finishBy: null,
  upAt: null,
  wait: 60,
  slots,
  carbon: [] as Slot[],
  ready: true,
  now: NOW,
  tariffInfo: e7Tariff,
};

describe('finishOptions', () => {
  test('lists whole hours from when the run could finish to the last price', () => {
    const options = finishOptions(slots, 120, NOW);
    expect(options.length).toBeGreaterThan(0);
    // Every option is on the hour, and none is sooner than a two-hour run could finish.
    for (const t of options) {
      expect(t % 3600000).toBe(0);
      expect(t).toBeGreaterThanOrEqual(NOW + 120 * 60000);
    }
    const last = slots[slots.length - 1].start + 30 * 60000;
    expect(options[options.length - 1]).toBeLessThanOrEqual(last);
  });

  test('is empty without prices or a run time', () => {
    expect(finishOptions([], 120, NOW)).toEqual([]);
    expect(finishOptions(slots, null, NOW)).toEqual([]);
  });
});

describe('whenModel', () => {
  test('finds the cheapest time in the cheap hours', () => {
    const m = whenModel(base);
    expect(m.result).not.toBeNull();
    expect(money(m.result!.best.cost)).toBe('5.6p');
    expect(m.plan).toBeNull();
    expect(m.soFar).toBe(false);
    expect(m.summary).toMatch(/^Start at .*\. Cost then 5\.6p, or /);
  });

  test('ready when up at 7am, waiting no more than an hour: start 4am, 7.7p', () => {
    const up = Date.UTC(2026, 9, 24, 6, 0); // 7am BST
    const m = whenModel({ ...base, upAt: up });
    expect(m.activeUpAt).toBe(up);
    expect(m.notBefore).toBe(up - 3600000);
    expect(m.latest).toBe(up);
    expect(money(m.result!.best.cost)).toBe('7.7p');
    expect(whenLabel(m.result!.best.start)).toMatch(/^4am/);
    // And what the cheapest time without a wake-up time would have been.
    expect(m.cheapestAny).not.toBeNull();
    expect(money(m.cheapestAny!.cost)).toBe('5.6p');
    expect(readyComparison(m.result!.best, m.cheapestAny)).toMatch(/^That's 2\.1p more than the cheapest time, which finishes at /);
  });

  test('ignores an "up at" time that is not on offer', () => {
    const m = whenModel({ ...base, upAt: NOW + 12345 });
    expect(m.activeUpAt).toBeNull();
    expect(m.notBefore).toBeNull();
  });

  test('"up at" does not apply to the electric car, which charges in spells instead', () => {
    const ev = APPLIANCES.find((a) => a.id === 'ev')!;
    const up = Date.UTC(2026, 9, 24, 6, 0);
    const m = whenModel({ ...base, applianceId: 'ev', kWh: ev.kWh, mins: ev.mins, upAt: up });
    expect(m.activeUpAt).toBeNull();
    expect(m.plan).not.toBeNull();
    expect(m.plan!.sessions.length).toBeGreaterThan(0);
    expect(m.summary).toMatch(/^Start charging (now|at .*), in \d+ spells?\. Cost /);
  });

  test('nothing to show until the figures are filled in or prices are ready', () => {
    expect(whenModel({ ...base, kWh: null }).result).toBeUndefined();
    expect(whenModel({ ...base, applianceId: null }).result).toBeUndefined();
    expect(whenModel({ ...base, ready: false, slots: [] }).result).toBeUndefined();
  });

  test('says when nothing fits before the deadline', () => {
    const options = finishOptions(slots, washer.mins, NOW);
    const soon = options[0];
    const m = whenModel({ ...base, mins: 600, finishBy: soon });
    // Ten hours can't finish by the first two-hour deadline, so the deadline is dropped as not on offer.
    expect(m.activeFinishBy).toBeNull();
    expect(summaryText({ plan: null, result: null, activeUpAt: null, activeFinishBy: soon, soFar: false })).toBe("There isn't enough time to finish by then.");
    expect(summaryText({ plan: null, result: null, activeUpAt: soon, activeFinishBy: null, soFar: false })).toBe("It can't be ready by then with the prices we have.");
    expect(summaryText({ plan: null, result: null, activeUpAt: null, activeFinishBy: null, soFar: false })).toBe('Not enough prices ahead for a run this long yet.');
  });

  test('a flat tariff costs the same at any time', () => {
    const flat = slots.map((s) => ({ ...s, price: 25 }));
    const m = whenModel({ ...base, slots: flat, tariffInfo: TARIFFS.find((t) => t.id === 'flat') });
    expect(m.result!.allSame).toBe(true);
    expect(m.summary).toBe('Any time costs the same. Each run costs about 20p.');
  });

  test('the greenest time comes from the carbon forecast', () => {
    const carbon = slots.map((s, i) => ({ start: s.start, price: i < 10 ? 300 : 100 }));
    const m = whenModel({ ...base, carbon });
    expect(m.green).not.toBeNull();
    const text = greenestText(m.green, m.result!.best, false)!;
    expect(text.title).toMatch(/^Greenest time: /);
    expect(text.body).toMatch(/^About \d+g of CO₂, against \d+g if you start it now\./);
    expect(greenestText(null, null, false)).toBeNull();
  });
});

describe('cheapest so far', () => {
  // A dynamic tariff with prices only up to tonight, cheapest in the 4pm to 7pm peak.
  const afternoon = Date.UTC(2026, 9, 23, 12, 0); // 1pm BST
  const agile = TARIFFS.find((t) => t.id === 'agile');
  const peakCheap: Slot[] = [];
  for (let i = 0; i < 20; i++) {
    const start = afternoon + i * 30 * 60000;
    const hour = (start - Date.UTC(2026, 9, 22, 23, 0)) / 3600000; // hours since midnight BST
    peakCheap.push({ start, price: hour >= 16 && hour < 19 ? 5 : 30 });
  }

  test('flags a peak-time best before tomorrow\'s prices are out', () => {
    const m = whenModel({ ...base, now: afternoon, slots: peakCheap, tariffInfo: agile });
    expect(m.pending).toBe(true);
    expect(m.soFar).toBe(true);
    expect(m.summary).toMatch(/^Cheapest so far: Start at /);
    const h = resultHeading(m.result!, true, null);
    expect(h.eyebrow).toBe('Cheapest so far');
    expect(h.title).toMatch(/^Cheapest so far: /);
  });

  test('is not flagged once prices reach into tomorrow', () => {
    const longer = [...peakCheap];
    for (let i = 20; i < 48; i++) longer.push({ start: afternoon + i * 30 * 60000, price: 30 });
    const m = whenModel({ ...base, now: afternoon, slots: longer, tariffInfo: agile });
    expect(m.pending).toBe(false);
    expect(m.soFar).toBe(false);
  });

  test('is not flagged on a tariff that is not dynamic', () => {
    const m = whenModel({ ...base, now: afternoon, slots: peakCheap, tariffInfo: e7Tariff });
    expect(m.pending).toBe(false);
    expect(m.soFar).toBe(false);
  });
});

describe('wording', () => {
  test('grams', () => {
    expect(grams(640)).toBe('640g');
    expect(grams(1240)).toBe('1.2kg');
  });

  test('reminder titles', () => {
    expect(reminderTitle('Washing machine')).toBe('Start the washing machine');
    expect(reminderTitle('Electric car')).toBe('Charge the electric car');
    expect(reminderTitle('Heated airer')).toBe('Switch on the heated airer');
    expect(reminderTitle('Iron')).toBe('Do the ironing');
    expect(reminderTitle('Electric shower')).toBe('Time for your shower');
  });

  test('no result messages', () => {
    expect(noResultText(1, null)).toMatch(/^It can't be ready by then/);
    expect(noResultText(null, 1)).toMatch(/^There isn't enough time/);
    expect(noResultText(null, null)).toMatch(/^We don't have prices far enough ahead/);
  });

  test('saving and standard tariff lines', () => {
    expect(savingText(0.02, 4, true, 'run')).toBeNull();
    expect(savingText(10, 4, true, 'run')).toBe('Waiting saves 10p, about £20.80 a year if you run it 4 times a week and prices stay like today.');
    expect(savingText(10, 4, false, 'run')).toBe('Waiting saves 10p.');
    expect(standardTariffText(0.8, 25, 'e7', 5.6)).toBe('On a standard tariff in your region it would cost 20p at any time of day.');
    expect(standardTariffText(0.8, 25, 'flat', 5.6)).toBeNull();
    expect(standardTariffText(0.8, null, 'e7', 5.6)).toBeNull();
  });

  test('share text', () => {
    const m = whenModel(base);
    const text = shareText(m.result!, washer.name, washer.perWeek);
    expect(text).toMatch(/^Running my washing machine at .* instead of now saves .*, about .* a year\. Find the cheapest time to run yours, free:$/);
    expect(shareText(m.result!, washer.name, 0)).toBe('Find the cheapest and greenest time to run your appliances on your electricity tariff, free:');
    expect(shareMessage('Hello')).toBe('Hello https://cheapwatts.co.uk/?utm_source=app&utm_medium=share&utm_campaign=when');
    const ev = APPLIANCES.find((a) => a.id === 'ev')!;
    const plan = whenModel({ ...base, applianceId: 'ev', kWh: ev.kWh, mins: ev.mins }).plan!;
    expect(chargeShareText(plan, ev.perWeek)).toMatch(/^Charging my car in the cheapest half hours/);
  });
});

describe('chart', () => {
  test('one bar per half hour, with the window highlighted and labels every six hours', () => {
    const bars = chartBars(slots, [{ from: 2, count: 3 }]);
    expect(bars.length).toBe(Math.min(48, slots.length));
    expect(bars.filter((b) => b.highlighted).map((b) => b.start)).toEqual([slots[2].start, slots[3].start, slots[4].start]);
    const ticks = chartTicks(bars);
    expect(ticks.map((t) => t.label)).toEqual(['12am', '6am', '12pm', '6pm']);
  });
});
