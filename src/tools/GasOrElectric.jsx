import { useState, useEffect } from "react";
import { gasRate } from "../prices";
import { money } from "../lib/format";
import { Card, StepTitle, NumberField, Note, Choice } from "../components/ui";
import PricesStatus from "../components/PricesStatus";
import WorthALook from "../components/WorthALook";
import { GAS_PICKS } from "../products";

// Energy each option uses, in kWh of electricity or gas. These are typical
// figures worked out from power ratings and rough efficiencies, stated on the
// page so people can judge them.
const COMPARISONS = [
  {
    id: "water", title: "Boil a litre of water",
    note: "A litre needs about 0.09kWh of heat. Kettles and induction hobs put most of that into the water; a gas flame loses more than half around the pan.",
    options: [
      { name: "Kettle", fuel: "elec", kWh: 0.11 },
      { name: "Induction hob", fuel: "elec", kWh: 0.11 },
      { name: "Electric hob (ceramic)", fuel: "elec", kWh: 0.14 },
      { name: "Gas hob", fuel: "gas", kWh: 0.22 },
    ],
  },
  {
    id: "meal", title: "Cook dinner",
    note: "Rough figures for one meal: oven for an hour, air fryer for 30 minutes, microwave for 15 minutes, slow cooker for 8 hours on low. Not every dish suits every method.",
    options: [
      { name: "Electric oven", fuel: "elec", kWh: 1.5 },
      { name: "Gas oven", fuel: "gas", kWh: 2.0 },
      { name: "Air fryer", fuel: "elec", kWh: 0.5 },
      { name: "Microwave", fuel: "elec", kWh: 0.25 },
      { name: "Slow cooker", fuel: "elec", kWh: 1.3 },
    ],
  },
  {
    id: "heat", title: "Keep warm for an hour",
    note: "About 1.5kW of heat for one room. A gas boiler is around 85% efficient but usually heats the whole house, so its real cost is often higher. Heat pumps and air conditioners in heating mode make roughly 3 units of heat per unit of electricity. A heated throw warms you, not the room.",
    options: [
      { name: "Electric heater", fuel: "elec", kWh: 1.5 },
      { name: "Gas central heating (one room's worth)", fuel: "gas", kWh: 1.76 },
      { name: "Heat pump or air conditioner", fuel: "elec", kWh: 0.5 },
      { name: "Heated throw or electric blanket", fuel: "elec", kWh: 0.1 },
    ],
  },
  {
    id: "shower", title: "Have an 8-minute shower",
    note: "A 9.5kW electric shower for 8 minutes, against a gas combi boiler (about 85% efficient) heating the same water. A shorter shower saves more than either.",
    options: [
      { name: "Electric shower", fuel: "elec", kWh: 1.27 },
      { name: "Gas boiler shower", fuel: "gas", kWh: 1.49 },
    ],
  },
  {
    id: "drying", title: "Dry a load of washing",
    note: "Typical full loads: tumble dryer 4kWh, heat pump dryer 1.5kWh, heated airer about 300W for 4 hours, dehumidifier about 250W for 8 hours in a closed room.",
    options: [
      { name: "Tumble dryer", fuel: "elec", kWh: 4.0 },
      { name: "Heat pump dryer", fuel: "elec", kWh: 1.5 },
      { name: "Heated airer", fuel: "elec", kWh: 1.2 },
      { name: "Dehumidifier", fuel: "elec", kWh: 2.0 },
      { name: "Washing line or clothes horse", fuel: "none", kWh: 0 },
    ],
  },
];

function Comparison({ c, elecRate, gasPrice }) {
  const rows = c.options
    .map((o) => ({ ...o, cost: o.kWh * (o.fuel === "gas" ? gasPrice : elecRate) }))
    .sort((a, b) => a.cost - b.cost);
  const max = Math.max(...rows.map((r) => r.cost), 0.01);
  return (
    <Card labelledBy={`cmp-${c.id}`}>
      <h2 id={`cmp-${c.id}`} className="text-xl font-semibold mb-3">{c.title}</h2>
      <ul className="space-y-2.5">
        {rows.map((r, i) => (
          <li key={r.name}>
            <div className="flex justify-between gap-3 text-sm">
              <span className={i === 0 ? "font-semibold text-relief" : "text-gray-800"}>
                {i === 0 && <span className="sr-only">Cheapest: </span>}
                {r.name} <span className="text-gray-600 font-normal">({r.fuel === "gas" ? "gas" : r.fuel === "none" ? "free" : "electric"})</span>
              </span>
              <span className="tabular-nums font-semibold">{money(r.cost)}</span>
            </div>
            <div className="h-2 mt-1 rounded-full bg-gray-100" aria-hidden="true">
              <div className={`h-2 rounded-full ${i === 0 ? "bg-relief" : "bg-[rgb(var(--bar))]"}`} style={{ width: `${Math.max(1, (r.cost / max) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <Note className="mt-4">{c.note}</Note>
    </Card>
  );
}

export default function GasOrElectric({ elec }) {
  const { slots, region, refRate, ready } = elec;
  const [gas, setGas] = useState({ region: null, unitRate: null });
  const [gasOverride, setGasOverride] = useState(null);
  const [elecChoice, setElecChoice] = useState("now");
  const [elecOverride, setElecOverride] = useState(null);

  useEffect(() => {
    if (!region) return;
    const ctrl = new AbortController();
    gasRate(region, ctrl.signal)
      .then((g) => setGas({ region, unitRate: g.unitRate }))
      .catch((e) => { if (e.name !== "AbortError") setGas({ region, unitRate: null }); });
    return () => ctrl.abort();
  }, [region]);

  const day = slots.slice(0, 48);
  const electricOptions = [
    ready && day.length && { id: "now", label: "Right now", rate: day[0].price },
    ready && day.length && { id: "cheapest", label: "Your cheapest half hour today", rate: Math.min(...day.map((s) => s.price)) },
    refRate != null && { id: "standard", label: "Standard tariff", rate: refRate },
  ].filter(Boolean);
  const picked = electricOptions.find((o) => o.id === elecChoice) ?? electricOptions[0];
  const elecRate = typeof elecOverride === "number" ? elecOverride : picked?.rate;
  const fetchedGas = gas.region === region ? gas.unitRate : null;
  const gasPrice = typeof gasOverride === "number" ? gasOverride : fetchedGas;

  return (
    <>
      <PricesStatus elec={elec} waiting />
      {ready && (
        <Card labelledBy="prices-title">
          <StepTitle n={2} id="prices-title">Your prices</StepTitle>
          <div className="space-y-4">
            <fieldset>
              <legend className="text-sm text-gray-600">Electricity price to use</legend>
              <div className="flex flex-wrap gap-2 mt-1">
                {electricOptions.map((o) => (
                  <Choice key={o.id} name="elec-price" on={elecOverride == null && picked?.id === o.id}
                    onChange={() => { setElecChoice(o.id); setElecOverride(null); }} className="px-3 py-2 text-sm">
                    <span className="font-semibold text-navy">{o.label}</span> <span className="tabular-nums text-gray-600">{o.rate.toFixed(1)}p</span>
                  </Choice>
                ))}
              </div>
              <div className="mt-2 max-w-xs">
                <NumberField label="Or type your own" value={elecOverride ?? ""} onChange={(v) => setElecOverride(v === "" ? null : v)} suffix="p/kWh" />
              </div>
            </fieldset>
            <div className="max-w-xs">
              <NumberField label="Gas price" value={gasOverride ?? (fetchedGas != null ? Number(fetchedGas.toFixed(2)) : "")}
                onChange={(v) => setGasOverride(v === "" ? null : v)} suffix="p/kWh" />
              <p className="text-xs text-gray-500 mt-1">
                {fetchedGas != null
                  ? <>Filled in with the typical standard gas rate for your region ({fetchedGas.toFixed(1)}p). Your bill shows your own.</>
                  : <>Enter the gas unit rate from your bill{!region && ", or choose your region in step 1 to fill in a typical rate"}.</>}
              </p>
            </div>
            <Note>Standing charges are the same whatever you use, so they're left out. Gas is usually cheaper per unit, but electric appliances often waste less, so the answer depends on the job.</Note>
          </div>
        </Card>
      )}

      {ready && elecRate != null && gasPrice != null && COMPARISONS.map((c) => (
        <Comparison key={c.id} c={c} elecRate={elecRate} gasPrice={gasPrice} />
      ))}
      {ready && elecRate != null && gasPrice != null && <Card><WorthALook picks={GAS_PICKS} place="gas" /></Card>}
    </>
  );
}
