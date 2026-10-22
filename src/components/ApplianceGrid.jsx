import {
  WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car, SlidersHorizontal, Check,
} from "lucide-react";
import { APPLIANCES } from "../appliances";
import { NAVY } from "./ui";

const ICONS = { WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car, SlidersHorizontal };

// Tile grid of appliances. Single-select by default; `multi` turns the tiles
// into toggles (selected is then a list of ids).
export default function ApplianceGrid({ selected, onPick, multi = false, includeCustom = true }) {
  const items = includeCustom ? [...APPLIANCES, { id: "custom", name: "Something else", icon: "SlidersHorizontal" }] : APPLIANCES;
  const isOn = (id) => (multi ? selected.includes(id) : selected === id);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role={multi ? "group" : "radiogroup"} aria-label="Appliance">
      {items.map((a) => {
        const Icon = ICONS[a.icon];
        const on = isOn(a.id);
        return (
          <button
            key={a.id} type="button" onClick={() => onPick(a.id)}
            {...(multi ? { "aria-pressed": on } : { role: "radio", "aria-checked": on })}
            className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 min-h-[88px] text-center transition-colors ${on ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"}`}
          >
            {multi && on && <Check size={16} className="absolute top-1.5 right-1.5" color={NAVY} aria-hidden="true" />}
            <Icon size={26} color={on ? NAVY : "#4b5563"} aria-hidden="true" />
            <span className={`text-sm leading-tight ${on ? "font-semibold text-navy" : "text-gray-700"}`}>{a.name}</span>
          </button>
        );
      })}
    </div>
  );
}
