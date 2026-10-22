import { useState, useEffect, useRef } from "react";
import { Zap, Clock, ListChecks, Flame, Sun, Scale } from "lucide-react";
import { useThemePreference, ThemeContext } from "./lib/theme";
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
  const theme = useThemePreference();
  const mainRef = useRef(null);

  // Tell screen reader users the page changed when they switch tools.
  useEffect(() => { document.title = `${tool.title} · When to run it`; }, [tool]);

  return (
    <ThemeContext.Provider value={theme.dark}>
    <div className="min-h-screen">
      <a
        href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-navy focus:font-semibold"
      >
        Skip to content
      </a>
      <header className="bg-brand text-onbrand">
        <div className="max-w-[680px] mx-auto px-4 pt-6 pb-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm uppercase tracking-wider text-onbrand/80 font-semibold flex items-center gap-1.5"><Zap size={16} aria-hidden="true" /> Cost of living tools</p>
            <label className="flex items-center gap-2 text-sm text-onbrand/90">
              <span>Theme</span>
              <select
                value={theme.pref} onChange={(e) => theme.setPref(e.target.value)}
                className="rounded-md bg-onbrand/10 border border-onbrand/40 text-onbrand px-2 py-1 [&>option]:text-gray-900 [&>option]:bg-white"
              >
                <option value="system">Match device</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-3" style={{ color: "#ffffff" }}>{tool.title}</h1>
          <p className="mt-3 text-onbrand/90 text-lg">{tool.intro}</p>
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
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap ${on ? "bg-cream text-navy" : "text-onbrand/90 hover:text-onbrand hover:bg-onbrand/10"}`}
                  >
                    <Icon size={16} aria-hidden="true" /> {t.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} className="max-w-[680px] mx-auto px-4 py-6 space-y-4 focus:outline-none">
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
      </main>

      <footer className="max-w-[680px] mx-auto px-4 text-sm text-gray-600 pt-4 pb-10 space-y-2">
          <p>
            Live prices come from the public price data published by Octopus Energy, EDF and E.ON Next, and include VAT. The standard rate shown for comparison is Octopus's standard variable tariff. Carbon figures are National Grid's regional forecast. Costs are estimates: real appliances use power unevenly, and your own model may use more or less.
          </p>
          <p>Not affiliated with any energy supplier.</p>
      </footer>
    </div>
    </ThemeContext.Provider>
  );
}
