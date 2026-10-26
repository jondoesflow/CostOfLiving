import {
  cleanPostcode,
  e7Error,
  normaliseTime,
  prefilledFlatRate,
  rateError,
  regionName,
  tariffAfterSupplierChange,
  timeError,
} from '../validate';

describe('normaliseTime', () => {
  test.each([
    ['00:30', '00:30'],
    ['7:30', '07:30'],
    [' 07:30 ', '07:30'],
    ['0730', '07:30'],
    ['730', '07:30'],
    ['7.30', '07:30'],
    ['23:59', '23:59'],
    ['0:00', '00:00'],
  ])('%s becomes %s', (input, expected) => {
    expect(normaliseTime(input)).toBe(expected);
  });

  test.each(['24:00', '7:60', '7', 'half seven', '', '7:3', '-1:00'])('rejects %s', (input) => {
    expect(normaliseTime(input)).toBeNull();
  });
});

describe('timeError', () => {
  test('is null for a valid time', () => {
    expect(timeError('07:30')).toBeNull();
  });
  test('asks for a time when empty', () => {
    expect(timeError('   ')).toMatch(/Enter a time/);
  });
  test('explains the 24-hour clock when invalid', () => {
    expect(timeError('7pm')).toMatch(/24-hour/);
  });
});

describe('rateError', () => {
  test('accepts ordinary rates', () => {
    expect(rateError(30)).toBeNull();
    expect(rateError(7.5)).toBeNull();
    expect(rateError(0.01)).toBeNull();
  });
  test('rejects empty, zero, negative and absurd values', () => {
    expect(rateError(null)).toMatch(/Enter the rate/);
    expect(rateError(0)).toMatch(/more than 0p/);
    expect(rateError(-5)).toMatch(/more than 0p/);
    expect(rateError(Number.NaN)).toMatch(/more than 0p/);
    expect(rateError(250)).toMatch(/too high/);
  });
});

describe('e7Error', () => {
  const ok = { nightStart: '00:30', nightEnd: '07:30', dayRate: 30, nightRate: 15 };
  test('is null when everything is fine', () => {
    expect(e7Error(ok)).toBeNull();
  });
  test('reports the first problem it finds', () => {
    expect(e7Error({ ...ok, nightStart: '' })).toMatch(/Enter a time/);
    expect(e7Error({ ...ok, nightEnd: '25:00' })).toMatch(/24-hour/);
    expect(e7Error({ ...ok, dayRate: null })).toMatch(/Enter the rate/);
    expect(e7Error({ ...ok, nightRate: 0 })).toMatch(/more than 0p/);
  });
  test('rejects a cheap window that starts and ends at the same time', () => {
    expect(e7Error({ ...ok, nightEnd: '0:30' })).toMatch(/different times/);
  });
});

describe('tariffAfterSupplierChange', () => {
  test('keeps the tariff when the new supplier offers it', () => {
    expect(tariffAfterSupplierChange('e7', 'britishgas')).toBe('e7');
    expect(tariffAfterSupplierChange('flat', 'edf')).toBe('flat');
  });
  test('falls back to the first tariff on offer', () => {
    expect(tariffAfterSupplierChange('agile', 'edf')).toBe('edf-dynamic');
    expect(tariffAfterSupplierChange('agile', 'ovo')).toBe('e7');
    expect(tariffAfterSupplierChange('edf-dynamic', 'octopus')).toBe('agile');
  });
});

describe('cleanPostcode', () => {
  test('tidies spacing and case', () => {
    expect(cleanPostcode('  sw1a   1aa ')).toBe('SW1A 1AA');
    expect(cleanPostcode('   ')).toBe('');
  });
});

describe('regionName', () => {
  test('names a known region and not an unknown one', () => {
    expect(regionName('C')).toBe('London');
    expect(regionName('Z')).toBeNull();
    expect(regionName('')).toBeNull();
  });
});

describe('prefilledFlatRate', () => {
  test('rounds the standard rate to two decimals like the website', () => {
    expect(prefilledFlatRate(24.8675)).toBe(24.87);
    expect(prefilledFlatRate(null)).toBeNull();
    expect(prefilledFlatRate(0)).toBeNull();
  });
});
