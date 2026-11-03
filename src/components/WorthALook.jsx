import { ShoppingBag, ExternalLink, Gauge, PlugZap, Rows3, Fan, AirVent, BedDouble, Soup, CookingPot, Timer, ShowerHead, Cylinder, Coffee, BatteryCharging, BatteryFull, Wind, DoorClosed, Mail, Thermometer, KeyRound, Layers, Blinds, AppWindow, Shield, Power } from "lucide-react";
import { productLink, DISCLOSURE } from "../products";

// Icon tiles stand in for product photos, which Amazon only allows once a
// site has made some sales.
const ICONS = { Gauge, PlugZap, Rows3, Fan, AirVent, BedDouble, Soup, CookingPot, Timer, ShowerHead, Cylinder, Coffee, BatteryCharging, BatteryFull, Wind, DoorClosed, Mail, Thermometer, KeyRound, Layers, Blinds, AppWindow, Shield, Power };

// Products that help with what the person just looked up. Clearly labelled as
// affiliate links and kept below the result, which never depends on them.
export default function WorthALook({ picks, place }) {
  if (!picks?.length) return null;
  return (
    <section aria-labelledby={`worth-${place}`} className="mt-5 rounded-xl border border-gray-200 p-4">
      <h3 id={`worth-${place}`} className="font-semibold text-navy flex items-center gap-2">
        <ShoppingBag size={20} aria-hidden="true" /> Worth a look
      </h3>
      <ul className="mt-2 divide-y divide-gray-100">
        {picks.map((p) => {
          const Icon = ICONS[p.icon] ?? ShoppingBag;
          const link = productLink(p);
          return (
          <li key={p.id} className="py-3 flex gap-3 items-start">
            <span className="shrink-0 w-14 h-14 rounded-xl bg-[#8b5cf6]/15 text-[#8b5cf6] flex items-center justify-center" aria-hidden="true">
              <Icon size={28} />
            </span>
            <span className="min-w-0">
            <a
              href={link.href} target="_blank" rel="noopener noreferrer sponsored"
              data-umami-event="affiliate-click" data-umami-event-product={p.id} data-umami-event-place={place} data-umami-event-retailer={link.retailer}
              className="font-semibold text-navy underline inline-flex items-center gap-1"
            >
              {p.name} <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> ({link.retailer}, opens in a new tab)</span>
            </a>
            <p className="text-sm text-gray-600">{p.why}</p>
            </span>
          </li>
          );
        })}
      </ul>
      <p className="text-xs text-gray-500 mt-2">{DISCLOSURE}</p>
    </section>
  );
}
