import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePref } from './prefs';
import {
  TARIFFS,
  currentSlotStart,
  economy7Slots,
  loadCarbon,
  loadSlots,
  standardRate,
  type E7,
  type Slot,
  type Tariff,
} from './shared';

// The user's electricity settings and everything loaded from them, shared by every tab.
// A port of the website's src/lib/useElectricity.js, with the settings kept on the device.

export const DEFAULT_E7: E7 = { nightStart: '00:30', nightEnd: '07:30', dayRate: 30, nightRate: 15 };

export interface Electricity {
  supplier: string;
  setSupplier: (id: string) => void;
  tariff: string;
  setTariff: (id: string) => void;
  region: string;
  setRegion: (code: string) => void;
  e7: E7;
  setE7: (e7: E7) => void;
  flatOverride: number | null;
  setFlatOverride: (rate: number | null) => void;
  /** Settings restored from the device; until then everything is the default. */
  restored: boolean;
  /** Half-hourly prices from now, in p/kWh. Empty until loaded. */
  slots: Slot[];
  /** True once prices for the current settings are on hand. */
  ready: boolean;
  loading: boolean;
  error: boolean;
  /** Tried and failed; call to try again. */
  reload: () => void;
  /** The region's standard (price cap) rate, for comparison. */
  refRate: number | null;
  /** The standard rate pre-filled for the "flat" tariff before the user types their own. */
  apiFlatRate: number | null;
  /** Grams of CO2 per kWh, half-hourly, for the greenest time. Empty if unavailable. */
  carbon: Slot[];
  /** "Now", ticking once a minute. */
  now: number;
  tariffInfo: Tariff | undefined;
  /** Whether the settings are complete enough to look prices up. */
  configured: boolean;
}

const Context = createContext<Electricity | null>(null);

export function ElectricityProvider({ children }: { children: ReactNode }) {
  const [supplier, setSupplier, loadedSupplier] = usePref<string>('supplier', '');
  const [tariff, setTariff, loadedTariff] = usePref<string>('tariff', 'agile');
  const [region, setRegion, loadedRegion] = usePref<string>('region', '');
  const [e7, setE7, loadedE7] = usePref<E7>('e7', DEFAULT_E7);
  const [flatOverride, setFlatOverride, loadedFlat] = usePref<number | null>('flatRate', null);
  const restored = loadedSupplier && loadedTariff && loadedRegion && loadedE7 && loadedFlat;

  const [fetched, setFetched] = useState<{ key: string | null; state: 'idle' | 'ready' | 'error'; data: Slot[]; ref: number | null }>({
    key: null,
    state: 'idle',
    data: [],
    ref: null,
  });
  const [carbon, setCarbon] = useState<{ key: string | null; data: Slot[] }>({ key: null, data: [] });
  const [attempt, setAttempt] = useState(0);

  // Tick once a minute so timers stay right, and refetch each new half hour.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const slotKey = currentSlotStart(now);

  const fetchKey = restored && supplier && tariff !== 'e7' && region ? `${tariff}|${region}` : null;
  useEffect(() => {
    if (!fetchKey) return;
    const ctrl = new AbortController();
    Promise.all([loadSlots(tariff, region, ctrl.signal), standardRate(region, ctrl.signal)])
      .then(([data, ref]) => setFetched({ key: fetchKey, state: 'ready', data, ref }))
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setFetched({ key: fetchKey, state: 'error', data: [], ref: null });
      });
    return () => ctrl.abort();
  }, [fetchKey, tariff, region, slotKey, attempt]);

  // The carbon forecast only needs the region and is a nice-to-have.
  useEffect(() => {
    if (!region) return;
    const ctrl = new AbortController();
    loadCarbon(region, ctrl.signal)
      .then((data) => setCarbon({ key: region, data }))
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setCarbon({ key: region, data: [] });
      });
    return () => ctrl.abort();
  }, [region, slotKey]);

  const value = useMemo<Electricity>(() => {
    const live = fetched.key === fetchKey && fetched.state === 'ready';
    const apiFlatRate = live ? fetched.ref : null;
    let slots: Slot[] = [];
    if (tariff === 'e7') {
      slots = economy7Slots(e7, currentSlotStart(now));
    } else if (tariff === 'flat') {
      const rate = typeof flatOverride === 'number' ? flatOverride : apiFlatRate;
      if (rate != null) {
        const start = currentSlotStart(now);
        for (let i = 0; i < 48; i++) slots.push({ start: start + i * 30 * 60000, price: rate });
      }
    } else if (live) {
      slots = fetched.data;
    }
    const configured = Boolean(supplier && (tariff === 'e7' || region));
    const needsFetch = Boolean(fetchKey);
    const error = needsFetch && fetched.key === fetchKey && fetched.state === 'error';
    const loading = needsFetch && !error && fetched.key !== fetchKey;
    return {
      supplier, setSupplier, tariff, setTariff, region, setRegion, e7, setE7, flatOverride, setFlatOverride, restored,
      slots,
      ready: configured && slots.length > 0,
      loading,
      error,
      reload: () => setAttempt((a) => a + 1),
      refRate: live ? fetched.ref : null,
      apiFlatRate,
      carbon: carbon.key === region ? carbon.data : [],
      now,
      tariffInfo: TARIFFS.find((t) => t.id === tariff),
      configured,
    };
  }, [supplier, setSupplier, tariff, setTariff, region, setRegion, e7, setE7, flatOverride, setFlatOverride, restored, fetched, fetchKey, carbon, now]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useElectricity(): Electricity {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useElectricity needs an ElectricityProvider');
  return ctx;
}
