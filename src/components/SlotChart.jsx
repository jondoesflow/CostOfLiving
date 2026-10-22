import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import { ukMinutes, SLOT_MS } from "../prices";
import { timeLabel, whenLabel } from "../lib/format";
import { MUTED_BAR } from "./ui";

// Half-hourly bar chart with one or more highlighted windows.
// `highlights` is a list of { from, count, color, label } in slot indexes.
export default function SlotChart({ slots, highlights = [], title, unit = "p", unitLong = "p per kWh", refValue, refLabel, ariaLabel }) {
  const colorFor = (i) => highlights.find((h) => i >= h.from && i < h.from + h.count)?.color;
  const data = slots.map((s, i) => ({ i, start: s.start, value: Number(s.price.toFixed(2)), color: colorFor(i) }));
  // Label every 6 hours on the clock, kept short so they fit on a phone.
  const ticks = data.filter((d) => ukMinutes(d.start) % 360 === 0).map((d) => d.i);
  const tickLabel = (i) => {
    const m = ukMinutes(data[i].start);
    return m === 0 ? "12am" : m === 720 ? "12pm" : timeLabel(data[i].start);
  };
  const fmt = (v) => (unit === "p" ? `${v}p` : `${v}`);

  return (
    <figure className="mt-6">
      <figcaption className="text-base font-semibold text-navy mb-1">{title}</figcaption>
      <p className="text-sm text-gray-600 mb-3 flex flex-wrap gap-x-4 gap-y-1">
        {highlights.map((h) => (
          <span key={h.label} className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: h.color }} /> {h.label}</span>
        ))}
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: MUTED_BAR }} /> Other times</span>
        {refValue != null && <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-gray-500" /> {refLabel}</span>}
      </p>
      <div className="h-56 -ml-3" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={1} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#eceae4" />
            <XAxis dataKey="i" ticks={ticks} tickFormatter={tickLabel} tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#d1d5db" }} tickLine={false} interval={0} />
            <YAxis width={40} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(29,52,97,0.06)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                    <div className="text-gray-600">{whenLabel(d.start)} – {timeLabel(d.start + SLOT_MS)}</div>
                    <div className="font-semibold text-gray-800 tabular-nums">{d.value.toFixed(1)} {unitLong}</div>
                  </div>
                );
              }}
            />
            {refValue != null && <ReferenceLine y={Number(refValue.toFixed(2))} stroke="#6b7280" strokeDasharray="4 3" />}
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.i} fill={d.color ?? MUTED_BAR} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-gray-600">Show as a table</summary>
        <table className="mt-2 w-full tabular-nums">
          <thead><tr className="text-left text-gray-500"><th className="font-normal py-1">From</th><th className="font-normal py-1 text-right">{unitLong}</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.i} className={d.color ? "font-semibold" : ""} style={d.color ? { color: d.color } : undefined}>
                <td className="py-0.5">{whenLabel(d.start)}</td>
                <td className="py-0.5 text-right">{d.value.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

