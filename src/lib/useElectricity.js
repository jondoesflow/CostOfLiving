import { useState, useEffect, useMemo } from "react";
import { TARIFFS, loadSlots, standardRate, economy7Slots, currentSlotStart } from "../prices";
import { loadCarbon } from "../carbon";
import { useSaved } from "./storage";

const DEFAULT_E7 = { nightStart: "00:30", nightEnd: "07:30", dayRate: 30, nightRate: 15 };

// The user's electricity settings and everything loaded from them, shared by
// every tool on the site.
export default function useElectricity() {
  const [supplier, setSupplier] = useSaved("supplier", "");
  const [tariff, setTariff] = useSaved("tariff", "agile");
  const [region, setRegion] = useSaved("region", "");
  const [e7, setE7] = useSaved("e7", DEFAULT_E7);
  const [flatOverride, setFlatOverride] = useSaved("flatRate", null);

  const [slots, setSlots] = useState({ key: null, state: "idle", data: [] });
  const [refRate, setRefRate] = useState(null);
  const [carbon, setCarbon] = useState({ key: null, data: [] });

  // Tick once a minute so timers stay right, and refetch each new half hour.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const slotKey = currentSlotStart(now);

  // Load prices whenever the tariff or region changes.
  const fetchKey = supplier && tariff !== "e7" && region ? `${tariff}|${region}` : null;
  useEffect(() => {
    if (!fetchKey) return;
    const ctrl = new AbortController();
    Promise.all([loadSlots(tariff, region, ctrl.signal), standardRate(region, ctrl.signal)])
      .then(([data, ref]) => {
        setSlots({ key: fetchKey, state: "ready", data });
        setRefRate(ref);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setSlots({ key: fetchKey, state: "error", data: [] });
      });
    return () => ctrl.abort();
  }, [fetchKey, tariff, region, slotKey]);
  // Half-hourly refreshes keep showing the old prices until the new ones land.
  const loading = Boolean(fetchKey && slots.key !== fetchKey);

  // The carbon forecast only depends on region, and is a nice-to-have: if it
  // fails, the tools simply leave it out.
  useEffect(() => {
    if (!region) return;
    const ctrl = new AbortController();
    loadCarbon(region, ctrl.signal)
      .then((data) => setCarbon({ key: region, data }))
      .catch((e) => { if (e.name !== "AbortError") setCarbon({ key: region, data: [] }); });
    return () => ctrl.abort();
  }, [region, slotKey]);

  // Economy 7 and user-entered flat rates are worked out locally.
  const effectiveSlots = useMemo(() => {
    if (tariff === "e7") {
      const ok = [e7.dayRate, e7.nightRate].every((v) => typeof v === "number") && e7.nightStart && e7.nightEnd;
      return ok ? economy7Slots(e7, slotKey) : [];
    }
    if (tariff === "flat" && typeof flatOverride === "number") {
      return slots.data.map((s) => ({ ...s, price: flatOverride }));
    }
    return slots.data;
  }, [tariff, e7, flatOverride, slots.data, slotKey]);

  const ready = !supplier ? false : tariff === "e7" ? effectiveSlots.length > 0 : !loading && slots.state === "ready";

  return {
    supplier, setSupplier, tariff, setTariff, region, setRegion, e7, setE7, flatOverride, setFlatOverride,
    tariffInfo: TARIFFS.find((t) => t.id === tariff),
    slots: effectiveSlots,
    // The standard-rate comparison only makes sense when we know the region.
    refRate: tariff === "e7" || !region ? null : refRate,
    apiFlatRate: tariff === "flat" && !loading ? slots.data[0]?.price : null,
    carbon: carbon.key === region ? carbon.data : [],
    fetchKey, loading, error: Boolean(fetchKey && !loading && slots.state === "error"), ready,
    now, slotKey,
  };
}
