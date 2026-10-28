import { useState, useEffect, useRef } from "react";
import { Zap, Clock, ListChecks, Flame, Sun, Scale, BookOpen } from "lucide-react";
import { useThemePreference, ThemeContext } from "./lib/theme";
import useElectricity from "./lib/useElectricity";
import TariffStep from "./components/TariffStep";
import WhenToRun from "./tools/WhenToRun";
import PlanEvening from "./tools/PlanEvening";
import GasOrElectric from "./tools/GasOrElectric";
import Solar from "./tools/Solar";
import SwitchCheck from "./tools/SwitchCheck";
import { PAGES, pageFor } from "./pages";

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

const CREATOR_LINKS = [
  { label: "JonDoesFlow", href: "https://www.jondoesflow.com/" },
  { label: "Created By", href: "https://www.linkedin.com/in/jondoesflow" },
  { label: "GitHub Projects", href: "https://github.com/jondoesflow?tab=repositories" },
];

// The tool comes from the address (/gas-or-electric/), falling back to the
// older #/gas links so shared links keep working.
function readTab() {
  const byPath = PAGES.find((p) => p.path !== "/" && window.location.pathname.startsWith(p.path.replace(/\/$/, "")));
  if (byPath) return byPath.id;
  const id = window.location.hash.replace(/^#\/?/, "");
  return TOOLS.some((t) => t.id === id) ? id : "when";
}

function useTab() {
  const [tab, setTab] = useState(readTab);
  useEffect(() => {
    const sync = () => setTab(readTab());
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);
  // Switch tools without a full reload, keeping a real, shareable address.
  const go = (id) => (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    window.history.pushState(null, "", pageFor(id).path);
    setTab(id);
  };
  return [tab, go];
}

export default function App() {
  const elec = useElectricity();
  const [tab, go] = useTab();
  const tool = TOOLS.find((t) => t.id === tab);
  const theme = useThemePreference();
  const mainRef = useRef(null);

  // Tell screen reader users the page changed when they switch tools.
  useEffect(() => {
    const page = pageFor(tool.id);
    document.title = page.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", page.description);
  }, [tool]);

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
        <div className="bg-black/25 text-sm">
          <div className="max-w-[680px] mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4">
            <p className="text-onbrand/90">
              This website is free to use. If you wish to make a contribution to my next project, please{" "}
              <a href="https://ko-fi.com/jondoesflow" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 text-onbrand hover:no-underline">
                click here<span className="sr-only"> to support me on Ko-fi (opens in a new tab)</span>
              </a>.
            </p>
            <nav aria-label="About the creator" className="shrink-0">
              <ul className="flex items-center gap-2 text-onbrand/90">
                {CREATOR_LINKS.map((l, i) => (
                  <li key={l.href} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden="true" className="text-onbrand/60">|</span>}
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline whitespace-nowrap">
                      {l.label}<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="max-w-[680px] mx-auto px-4 pt-6 pb-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm uppercase tracking-wider text-onbrand/80 font-semibold flex items-center gap-1.5"><Zap size={16} aria-hidden="true" /> Cheap Watts</p>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a href="/blog/" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold text-onbrand border border-onbrand/40 hover:bg-onbrand/10">
                <BookOpen size={16} aria-hidden="true" /> Blog
              </a>
              <label className="flex items-center gap-2 text-sm text-onbrand/90">
                <span className="sr-only sm:not-sr-only">Theme</span>
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
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-3" style={{ color: "#ffffff" }}>{tool.title}</h1>
          <p className="mt-3 text-onbrand/90 text-lg">{tool.intro}</p>
        </div>
        <nav aria-label="Tools" className="max-w-[680px] mx-auto px-4">
          {/* Five equal columns that always fit the width: the icon sits above the
              label, and long labels wrap rather than being cut off. */}
          <ul className="grid grid-cols-5 gap-1 -mb-px">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const on = t.id === tab;
              return (
                <li key={t.id} className="min-w-0 flex">
                  <a
                    href={pageFor(t.id).path} onClick={go(t.id)} aria-current={on ? "page" : undefined}
                    className={`flex-1 flex flex-col items-center justify-start gap-1 px-1 sm:px-2 pt-2.5 pb-2 rounded-t-lg text-xs sm:text-sm leading-tight text-center font-semibold [overflow-wrap:anywhere] ${on ? "bg-cream text-navy" : "text-onbrand/90 hover:text-onbrand hover:bg-onbrand/10"}`}
                  >
                    <Icon size={18} aria-hidden="true" className="shrink-0" /> {t.label}
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
            Live prices come from the public price data published by Octopus Energy, EDF and E.ON Next, and include VAT. The standard rate shown for comparison is Octopus's standard variable tariff. Carbon figures are National Grid's regional forecast. Costs are estimates. Washing machines, washer-dryers and dishwashers are counted as using most of their power while heating; everything else as using it evenly. Your own model may use more or less.
          </p>
          <p>Not affiliated with any energy supplier. Some "Worth a look" links go to Amazon: as an Amazon Associate, Cheap Watts earns from qualifying purchases, at no extra cost to you.</p>
      </footer>
    </div>
    </ThemeContext.Provider>
  );
}
