// Reads half-hourly electricity usage from the CSV files suppliers and smart
// meter apps export. Formats vary, so this looks for a date/time column and
// a kWh column by name, and accepts ISO or UK (DD/MM/YYYY) dates.
import { SLOT_MS, currentSlotStart } from "../prices.js";

const MAX_DAYS = 90;

// A wall-clock time in the UK to a UTC timestamp, allowing for summer time.
function ukLocal(y, mo, d, h = 0, mi = 0) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(guess)).map((p) => [p.type, p.value]));
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return guess - (shown - guess);
}

function parseTime(text) {
  const s = text.trim().replace(/^"|"$/g, "");
  if (!s) return null;
  // ISO with an explicit zone: trust it.
  if (/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}.*(Z|[+-]\d{2}:?\d{2})$/i.test(s)) {
    const t = Date.parse(s.replace(" ", "T"));
    return Number.isNaN(t) ? null : t;
  }
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?/);
  if (m) return ukLocal(+m[1], +m[2], +m[3], +(m[4] ?? 0), +(m[5] ?? 0));
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:,?\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return ukLocal(year, +m[2], +m[1], +(m[4] ?? 0), +(m[5] ?? 0));
  }
  return null;
}

function splitLine(line, delimiter) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === delimiter && !quoted) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function findColumns(header) {
  const h = header.map((c) => c.toLowerCase());
  const isMoney = (c) => /cost|charge|price|£|\(p\)|pence|export|generat/.test(c);
  const value = h.findIndex((c) => /consum|kwh|usage|import|energy|reading|value/.test(c) && !isMoney(c));
  const pick = (re) => h.findIndex((c) => re.test(c));
  let time = pick(/start|from|interval|period/);
  if (time < 0) time = pick(/timestamp|date.?time|datetime/);
  const date = pick(/^date$|\bdate\b/);
  const clock = pick(/^time$|\btime\b/);
  if (time < 0 && date >= 0 && clock >= 0 && date !== clock) return { value, date, clock };
  if (time < 0) time = date;
  return { value, time };
}

// Returns { readings: [{ t, kWh }] in half-hour slots, days, from, to } or
// throws an Error with a message fit to show the user.
export function parseUsage(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 3) throw new Error("That file looks empty.");
  const delimiter = (lines[0].match(/;/g) ?? []).length > (lines[0].match(/,/g) ?? []).length ? ";" : ",";
  const first = splitLine(lines[0], delimiter);
  const hasHeader = first.some((c) => /[a-z]/i.test(c) && parseTime(c) == null && Number.isNaN(Number(c)));
  let cols = hasHeader ? findColumns(first) : { time: 0, value: 1 };
  if (hasHeader && (cols.value < 0 || (cols.time ?? cols.date) < 0)) cols = { time: 0, value: first.length > 1 ? 1 : -1 };
  if (cols.value < 0) throw new Error("We couldn't find a column of kWh readings in that file.");

  const raw = [];
  for (const line of lines.slice(hasHeader ? 1 : 0)) {
    const cells = splitLine(line, delimiter);
    const t = cols.date != null ? parseTime(`${cells[cols.date]} ${cells[cols.clock]}`) : parseTime(cells[cols.time] ?? "");
    const kWh = Number(String(cells[cols.value] ?? "").replace(/[^0-9.-]/g, ""));
    if (t != null && Number.isFinite(kWh) && cells[cols.value] !== "") raw.push({ t, kWh });
  }
  if (raw.length < 48) throw new Error("We couldn't read enough dated kWh readings from that file. It needs at least a day of half-hourly data.");
  raw.sort((a, b) => a.t - b.t);

  // Work out the reading interval from the typical gap between readings.
  const gaps = raw.slice(1).map((r, i) => r.t - raw[i].t).filter((g) => g > 0).sort((a, b) => a - b);
  const step = gaps[Math.floor(gaps.length / 2)];
  if (step > 60 * 60 * 1000) throw new Error("That file has daily or monthly totals. To compare time-of-use tariffs we need half-hourly (or hourly) readings.");

  // Put everything into half-hour slots: shorter readings are added up,
  // hourly ones are split evenly across their two half hours.
  const slots = new Map();
  for (const r of raw) {
    if (step > SLOT_MS) {
      const s = currentSlotStart(r.t);
      slots.set(s, (slots.get(s) ?? 0) + r.kWh / 2);
      slots.set(s + SLOT_MS, (slots.get(s + SLOT_MS) ?? 0) + r.kWh / 2);
    } else {
      const s = currentSlotStart(r.t);
      slots.set(s, (slots.get(s) ?? 0) + r.kWh);
    }
  }
  let readings = [...slots].map(([t, kWh]) => ({ t, kWh })).sort((a, b) => a.t - b.t);
  const cutoff = readings[readings.length - 1].t - MAX_DAYS * 24 * 3600 * 1000;
  readings = readings.filter((r) => r.t > cutoff);
  const from = readings[0].t;
  const to = readings[readings.length - 1].t + SLOT_MS;
  return { readings, from, to, days: (to - from) / (24 * 3600 * 1000), total: readings.reduce((s, r) => s + r.kWh, 0) };
}

// Four weeks of made-up usage for a typical home (about 2,900kWh a year), so
// people can see how the comparison works before finding their own file.
export function exampleUsage() {
  const end = currentSlotStart() - 24 * 3600 * 1000;
  const start = end - 28 * 24 * 3600 * 1000;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const lines = ["Start,Consumption (kWh)"];
  for (let t = start; t < end; t += SLOT_MS) {
    const hour = new Date(t).getUTCHours() + new Date(t).getUTCMinutes() / 60;
    let base = 0.09;
    if (hour >= 6.5 && hour < 9) base = 0.2;
    else if (hour >= 9 && hour < 16) base = 0.13;
    else if (hour >= 16 && hour < 21.5) base = 0.3;
    else if (hour >= 21.5 && hour < 23.5) base = 0.17;
    lines.push(`${new Date(t).toISOString()},${(base * (0.6 + rand() * 0.8)).toFixed(3)}`);
  }
  return lines.join("\n");
}
