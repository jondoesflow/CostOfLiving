import {
  WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car, SlidersHorizontal, Check,
  Rows3, Shirt, Croissant, ShowerHead, BedDouble, Accessibility,
} from "lucide-react";
import { APPLIANCES, APPLIANCE_GROUPS } from "../appliances";
import { Choice } from "./ui";

const ICONS = {
  WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car, SlidersHorizontal,
  Rows3, Shirt, Croissant, ShowerHead, BedDouble, Accessibility,
};

function Tile({ a, on, multi, onPick }) {
  const Icon = ICONS[a.icon];
  return (
    <Choice
      name="appliance" type={multi ? "checkbox" : "radio"} on={on} onChange={() => onPick(a.id)}
      className="relative flex flex-col items-center justify-center gap-1 px-2 min-h-[88px] text-center"
    >
      {multi && on && <Check size={16} className="absolute top-1.5 right-1.5 text-navy" aria-hidden="true" />}
      <Icon size={26} className={on ? "text-navy" : "text-gray-600"} aria-hidden="true" />
      <span className={`text-sm leading-tight ${on ? "font-semibold text-navy" : "text-gray-700"}`}>{a.name}</span>
    </Choice>
  );
}

// Appliance tiles in groups, backed by radio buttons (pick one) or
// checkboxes (`multi`, pick several; `selected` is then a list of ids).
export default function ApplianceGrid({ selected, onPick, multi = false, includeCustom = true, legend = "Appliance" }) {
  const isOn = (id) => (multi ? selected.includes(id) : selected === id);
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="space-y-4">
        {APPLIANCE_GROUPS.map((g) => (
          <div key={g.id} role="group" aria-labelledby={`group-${g.id}`}>
            <h3 id={`group-${g.id}`} className="text-sm font-semibold font-body text-gray-600 uppercase tracking-wide mb-2">{g.name}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {APPLIANCES.filter((a) => a.group === g.id).map((a) => (
                <Tile key={a.id} a={a} on={isOn(a.id)} multi={multi} onPick={onPick} />
              ))}
              {includeCustom && g.id === APPLIANCE_GROUPS[APPLIANCE_GROUPS.length - 1].id && (
                <Tile a={{ id: "custom", name: "Something else", icon: "SlidersHorizontal" }} on={isOn("custom")} multi={multi} onPick={onPick} />
              )}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
