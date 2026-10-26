import { COMPARISONS } from '../comparisons';
import { comparisonRows, electricOptions, fuelLabel, pickElectricOption, resolveRate } from '../view';

const water = COMPARISONS.find((c) => c.id === 'water')!;
const drying = COMPARISONS.find((c) => c.id === 'drying')!;

describe('comparisonRows', () => {
  test('prices gas options at the gas rate and electric ones at the electricity rate', () => {
    const rows = comparisonRows(water, 30, 6);
    const kettle = rows.find((r) => r.name === 'Kettle')!;
    const gasHob = rows.find((r) => r.name === 'Gas hob')!;
    expect(kettle.cost).toBeCloseTo(0.11 * 30);
    expect(gasHob.cost).toBeCloseTo(0.22 * 6);
    expect(kettle.fuelLabel).toBe('electric');
    expect(gasHob.fuelLabel).toBe('gas');
  });

  test('sorts cheapest first and marks only the first row as cheapest', () => {
    const rows = comparisonRows(water, 30, 6);
    const costs = rows.map((r) => r.cost);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
    expect(rows[0].name).toBe('Gas hob');
    expect(rows.map((r) => r.cheapest)).toEqual([true, false, false, false]);
  });

  test('the cheapest option changes with the prices', () => {
    const rows = comparisonRows(water, 7, 6);
    expect(rows[0].name).toBe('Kettle');
    expect(rows[rows.length - 1].name).toBe('Gas hob');
    expect(rows[1].name).toBe('Induction hob');
  });

  test('bar fractions are relative to the dearest option', () => {
    const rows = comparisonRows(water, 30, 6);
    const dearest = rows[rows.length - 1];
    expect(dearest.fraction).toBe(1);
    const kettle = rows.find((r) => r.name === 'Kettle')!;
    expect(kettle.fraction).toBeCloseTo((0.11 * 30) / (0.14 * 30));
    rows.forEach((r) => {
      expect(r.fraction).toBeGreaterThan(0);
      expect(r.fraction).toBeLessThanOrEqual(1);
    });
  });

  test('free rows cost nothing, come first and keep a sliver of bar', () => {
    const rows = comparisonRows(drying, 30, 6);
    expect(rows[0].name).toBe('Washing line or clothes horse');
    expect(rows[0].cost).toBe(0);
    expect(rows[0].fuelLabel).toBe('free');
    expect(rows[0].cheapest).toBe(true);
    expect(rows[0].fraction).toBe(0.01);
  });

  test('all-zero prices still give finite fractions', () => {
    const rows = comparisonRows(water, 0, 0);
    rows.forEach((r) => expect(r.fraction).toBe(0.01));
  });
});

describe('fuelLabel', () => {
  test('matches the website wording', () => {
    expect(fuelLabel('elec')).toBe('electric');
    expect(fuelLabel('gas')).toBe('gas');
    expect(fuelLabel('none')).toBe('free');
  });
});

describe('electricOptions', () => {
  const slots = [
    { start: 0, price: 25 },
    { start: 1, price: 12.5 },
    { start: 2, price: 31 },
  ];

  test('offers now, cheapest today and the standard tariff when prices are ready', () => {
    const options = electricOptions(slots, 27.3, true);
    expect(options).toEqual([
      { id: 'now', label: 'Right now', rate: 25 },
      { id: 'cheapest', label: 'Your cheapest half hour today', rate: 12.5 },
      { id: 'standard', label: 'Standard tariff', rate: 27.3 },
    ]);
  });

  test('only looks at the first 48 half hours for the cheapest', () => {
    const long = Array.from({ length: 60 }, (_, i) => ({ start: i, price: i < 48 ? 20 : 1 }));
    expect(electricOptions(long, null, true)).toEqual([
      { id: 'now', label: 'Right now', rate: 20 },
      { id: 'cheapest', label: 'Your cheapest half hour today', rate: 20 },
    ]);
  });

  test('leaves out what is not available', () => {
    expect(electricOptions(slots, null, false)).toEqual([]);
    expect(electricOptions([], 27.3, true)).toEqual([{ id: 'standard', label: 'Standard tariff', rate: 27.3 }]);
  });

  test('picks the chosen option or falls back to the first', () => {
    const options = electricOptions(slots, 27.3, true);
    expect(pickElectricOption(options, 'standard')?.rate).toBe(27.3);
    expect(pickElectricOption(options.slice(0, 2), 'standard')?.id).toBe('now');
    expect(pickElectricOption([], 'now')).toBeUndefined();
  });
});

describe('resolveRate', () => {
  test('a typed value wins over the fetched one', () => {
    expect(resolveRate(8, 6.2)).toBe(8);
    expect(resolveRate(0, 6.2)).toBe(0);
    expect(resolveRate(null, 6.2)).toBe(6.2);
    expect(resolveRate(null, null)).toBeNull();
    expect(resolveRate(null, undefined)).toBeNull();
  });
});
