import {
  WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car, SlidersHorizontal, Check,
} from "lucide-react";
import { APPLIANCES } from "../appliances";
import { Choice } from "./ui";

const ICONS = { WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car, SlidersHorizontal };

// Tile grid of appliances, backed by radio buttons (pick one) or checkboxes
// (`multi`, pick several; `selected` is then a list of ids).
export default function ApplianceGrid({ selected, onPick, multi = false, includeCustom = true, legend = "Appliance" }) {
  const items = includeCustom ? [...APPLIANCES, { id: "custom", name: "Something else", icon: "SlidersHorizontal" }] : APPLIANCES;
  const isOn = (id) => (multi ? selected.includes(id) : selected === id);
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {items.map((a) => {
          const Icon = ICONS[a.icon];
          const on = isOn(a.id);
          return (
            <Choice
              key={a.id} name="appliance" type={multi ? "checkbox" : "radio"} on={on} onChange={() => onPick(a.id)}
              className="relative flex flex-col items-center justify-center gap-1 px-2 min-h-[88px] text-center"
            >
              {multi && on && <Check size={16} className="absolute top-1.5 right-1.5 text-navy" aria-hidden="true" />}
              <Icon size={26} className={on ? "text-navy" : "text-gray-600"} aria-hidden="true" />
              <span className={`text-sm leading-tight ${on ? "font-semibold text-navy" : "text-gray-700"}`}>{a.name}</span>
            </Choice>
          );
        })}
      </div>
    </fieldset>
  );
}
