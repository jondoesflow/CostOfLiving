import { createContext, useContext, useEffect, useState } from "react";
import { useSaved } from "./storage";

const media = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null);

// "system" follows the device setting; "light" or "dark" overrides it.
export function useThemePreference() {
  const [pref, setPref] = useSaved("theme", "system");
  const [systemDark, setSystemDark] = useState(() => media()?.matches ?? false);
  useEffect(() => {
    const m = media();
    if (!m) return;
    const onChange = (e) => setSystemDark(e.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);
  const dark = pref === "dark" || (pref === "system" && systemDark);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  return { pref, setPref, dark };
}

export const ThemeContext = createContext(false);
export const useDark = () => useContext(ThemeContext);

// Chart colours (SVG attributes can't read CSS variables), matching src/index.css.
const CHART = {
  light: { relief: "rgb(45 106 79)", ink: "rgb(29 52 97)", bar: "rgb(133 146 163)", grid: "rgb(236 234 228)", axis: "rgb(107 114 128)", zero: "rgb(156 163 175)", cursor: "rgba(29,52,97,0.08)" },
  dark: { relief: "rgb(92 192 143)", ink: "rgb(169 196 245)", bar: "rgb(95 109 128)", grid: "rgb(46 56 70)", axis: "rgb(154 164 178)", zero: "rgb(107 118 134)", cursor: "rgba(169,196,245,0.12)" },
};
export const useChartColors = () => CHART[useDark() ? "dark" : "light"];
