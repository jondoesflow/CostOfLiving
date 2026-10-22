import { useState } from "react";
import { MapPin } from "lucide-react";
import { REGIONS } from "../appliances";
import { SUPPLIERS, tariffsFor, regionFromPostcode } from "../prices";
import { Card, StepTitle, NumberField, Choice } from "./ui";

// ---------- step 1: tariff and region ----------
export default function TariffStep({ supplier, setSupplier, tariff, setTariff, region, setRegion, e7, setE7, flatOverride, setFlatOverride, apiFlatRate }) {
  const [postcode, setPostcode] = useState("");
  const [lookup, setLookup] = useState({ state: "idle" });

  async function findRegion(e) {
    e.preventDefault();
    if (!postcode.trim()) return;
    setLookup({ state: "loading" });
    try {
      const code = await regionFromPostcode(postcode);
      if (!code) throw new Error();
      setRegion(code);
      setLookup({ state: "done", name: REGIONS.find((r) => r.code === code)?.name });
    } catch {
      setLookup({ state: "error" });
    }
  }

  const needsRegion = !!supplier;
  const supplierInfo = SUPPLIERS.find((s) => s.id === supplier);
  const tariffs = supplier ? tariffsFor(supplier) : [];

  function chooseSupplier(id) {
    setSupplier(id);
    // Keep the tariff if the new supplier offers it, otherwise pick a sensible default.
    const options = tariffsFor(id);
    if (!options.some((t) => t.id === tariff)) setTariff(options[0].id);
  }

  return (
    <Card labelledBy="settings-title">
      <StepTitle n={1} id="settings-title">Your electricity</StepTitle>
      <label className="block mb-4">
        <span className="text-sm text-gray-600">Who supplies your electricity?</span>
        <select
          value={supplier || ""} onChange={(e) => chooseSupplier(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="" disabled>Choose your supplier…</option>
          {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </label>

      {supplier && (
        <fieldset>
          <legend className="text-sm text-gray-600 mb-3">
            {supplierInfo?.api
              ? "Which tariff are you on? It's on your bill or in your supplier's app."
              : `We can't get live prices from ${supplier === "other" ? "your supplier" : supplierInfo.name} yet. If you have cheaper hours (Economy 7, an EV tariff or similar), choose the off-peak option and copy the times and rates from your bill.`}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tariffs.map((t) => (
              <Choice key={t.id} name="tariff" on={t.id === tariff} onChange={() => setTariff(t.id)} title={t.label} subtitle={t.blurb} />
            ))}
          </div>
        </fieldset>
      )}

      {needsRegion && (
        <div className="mt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 block">
              <span className="text-sm text-gray-600">Region</span>
              <select
                value={region || ""} onChange={(e) => { setRegion(e.target.value); setLookup({ state: "idle" }); }}
                aria-describedby="region-help"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="" disabled>Choose your region…</option>
                {REGIONS.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
            </label>
            <form onSubmit={findRegion} className="flex-1">
              <label className="block">
                <span className="text-sm text-gray-600">Or find it by postcode</span>
                <span className="mt-1 flex gap-2">
                  <input
                    value={postcode} onChange={(e) => setPostcode(e.target.value)} autoComplete="postal-code"
                    aria-describedby="postcode-help"
                    className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 uppercase bg-white"
                  />
                  <button type="submit" className="px-3 py-2 rounded-lg bg-brand text-onbrand text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                    <MapPin size={16} aria-hidden="true" /> Find
                  </button>
                </span>
              </label>
            </form>
          </div>
          <p id="region-help" className="text-sm text-gray-600 mt-2">
            {tariff === "e7" ? "Your region (optional) lets us show the greenest time too." : "Prices depend on where you live."}
          </p>
          <div role="status" className="text-sm mt-1">
            {lookup.state === "loading" && <p className="text-gray-600">Looking up your region…</p>}
            {lookup.state === "done" && <p className="text-relief">Found it: {lookup.name}.</p>}
            {lookup.state === "error" && <p className="text-warning">We couldn't find that postcode. Pick your region from the list instead.</p>}
          </div>
          <p id="postcode-help" className="text-xs text-gray-500 mt-1">Your postcode is only used to find your region. It isn't stored.</p>
        </div>
      )}

      {tariff === "e7" && supplier && (
        <fieldset className="mt-5">
          <legend className="text-sm text-gray-600 mb-3">Cheap hours vary by tariff and by meter. Check your bill or app and change these to match yours.</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-600">Cheap rate starts</span>
              <input type="time" value={e7.nightStart} onChange={(e) => setE7({ ...e7, nightStart: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Cheap rate ends</span>
              <input type="time" value={e7.nightEnd} onChange={(e) => setE7({ ...e7, nightEnd: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white" />
            </label>
            <NumberField label="Normal rate" value={e7.dayRate} onChange={(v) => setE7({ ...e7, dayRate: v })} suffix="p/kWh" />
            <NumberField label="Cheap rate" value={e7.nightRate} onChange={(v) => setE7({ ...e7, nightRate: v })} suffix="p/kWh" />
          </div>
        </fieldset>
      )}

      {tariff === "flat" && region && supplier && (
        <div className="mt-5 max-w-xs">
          <NumberField
            label="Your unit rate (from your bill)" value={flatOverride ?? (apiFlatRate ? Number(apiFlatRate.toFixed(2)) : "")}
            onChange={setFlatOverride} suffix="p/kWh"
          />
          {apiFlatRate && (
            <p className="text-xs text-gray-500 mt-1">
              We've filled in the typical standard rate for your region ({apiFlatRate.toFixed(1)}p).
              {flatOverride != null && <> <button type="button" className="underline" onClick={() => setFlatOverride(null)}>Reset</button></>}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
