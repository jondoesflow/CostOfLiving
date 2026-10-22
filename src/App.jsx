import { useState, useEffect } from "react";
import { Zap, Clock, ListChecks, Flame, Sun, Scale } from "lucide-react";
import useElectricity from "./lib/useElectricity";
import TariffStep from "./components/TariffStep";
import WhenToRun from "./tools/WhenToRun";
import PlanEvening from "./tools/PlanEvening";
import GasOrElectric from "./tools/GasOrElectric";
import Solar from "./tools/Solar";
import SwitchCheck from "./tools/SwitchCheck";

const TOOLS = [
  { id: "when", label: "When to run", icon: Clock, title: "When's cheapest to run it?",
    intro: "Pick an appliance and we'll find the cheapest time to switch it on today or tonight, and tell you what it'll cost." },
  { id: "plan", label: "Plan my evening", icon: ListChecks, title: "Plan my evening",
    intro: "Got the washing, the dishwasher and the car to do? We'll fit them all into the cheapest hours." },
  { id: "gas", label: "Gas or electric?", icon: Flame, title: "Gas or electric?",
    intro: "Kettle or hob? Heater or central heating? See what each one costs at today's prices." },
  { id: "solar", label: "Solar & batteries", icon: Sun, title: "Solar panels and batteries",
    intro: "Should you use your solar power or sell it? When should your battery charge and empty?" },
  { id: "switch", label: "Should I switch?", icon: Scale, title: "Should I switch tariff?",
    intro: "Use your own half-hourly usage to see what you'd have paid on each tariff." },
];

function useHashTab() {
  const read = () => {
    const id = window.location.hash.replace(/^#\/?/, "");
    return TOOLS.some((t) => t.id === id) ? id : "when";
  };
  const [tab, setTab] = useState(read);
  useEffect(() => {
    const onHash = () => setTab(read());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return tab;
}

export default function App() {
  const elec = useElectricity();
  const tab = useHashTab();
  const tool = TOOLS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen">
      <header className="bg-navy text-white">
        <div className="max-w-[680px] mx-auto px-4 pt-8 pb-6">
          <p className="text-sm uppercase tracking-wider text-white/70 font-semibold flex items-center gap-1.5"><Zap size={16} /> Cost of living tools</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2" style={{ color: "white" }}>{tool.title}</h1>
          <p className="mt-3 text-white/85 text-lg">{tool.intro}</p>
        </div>
        <nav aria-label="Tools" className="max-w-[680px] mx-auto px-4">
          <ul className="flex gap-1 overflow-x-auto -mb-px pb-0" style={{ scrollbarWidth: "none" }}>
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const on = t.id === tab;
              return (
                <li key={t.id} className="shrink-0">
                  <a
                    href={`#/${t.id}`} aria-current={on ? "page" : undefined}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap ${on ? "bg-cream text-navy" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                  >
                    <Icon size={16} aria-hidden="true" /> {t.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-6 space-y-4">
        <TariffStep
          supplier={elec.supplier} setSupplier={elec.setSupplier} tariff={elec.tariff} setTariff={elec.setTariff}
          region={elec.region} setRegion={elec.setRegion} e7={elec.e7} setE7={elec.setE7}
          flatOverride={elec.flatOverride} setFlatOverride={elec.setFlatOverride} apiFlatRate={elec.apiFlatRate}
        />

        {tab === "when" && <WhenToRun elec={elec} />}
        {tab === "plan" && <PlanEvening elec={elec} />}
        {tab === "gas" && <GasOrElectric elec={elec} />}
        {tab === "solar" && <Solar elec={elec} />}
        {tab === "switch" && <SwitchCheck elec={elec} />}

        <footer className="text-sm text-gray-500 pt-4 pb-10 space-y-2">
          <p>
            Live prices come from the public price data published by Octopus Energy, EDF and E.ON Next, and include VAT. The standard rate shown for comparison is Octopus's standard variable tariff. Carbon figures are National Grid's regional forecast. Costs are estimates: real appliances use power unevenly, and your own model may use more or less.
          </p>
          <p>Not affiliated with any energy supplier.</p>
        </footer>
      </main>
    </div>
  );
}
