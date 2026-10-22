import { ukMinutes } from "../prices";

export const ukDate = (t) => new Date(t).toLocaleDateString("en-GB", { timeZone: "Europe/London" });

export function timeLabel(t) {
  const m = ukMinutes(t);
  if (m === 0) return "midnight";
  if (m === 720) return "midday";
  return new Date(t)
    .toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit", hour12: true })
    .replace(":00", "")
    .replace(" ", "");
}

function dayWord(t) {
  const now = Date.now();
  if (ukDate(t) === ukDate(now)) return "today";
  if (ukDate(t) === ukDate(now + 24 * 3600 * 1000)) return "tomorrow";
  return new Date(t).toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
}

export function whenLabel(t) {
  const day = dayWord(t);
  const time = timeLabel(t);
  const hour = Math.floor(ukMinutes(t) / 60);
  if (day === "today" && hour >= 18) return `${time} tonight`;
  if (day === "tomorrow" && ukMinutes(t) === 0) return "midnight tonight";
  return `${time} ${day}`;
}

export function money(pence) {
  const abs = Math.abs(pence);
  const s = abs >= 100 ? `£${(abs / 100).toFixed(2)}` : abs < 10 ? `${abs.toFixed(1)}p` : `${Math.round(abs)}p`;
  return pence < 0 ? `-${s}` : s;
}

export function pounds(pence) {
  return `£${Math.round(pence / 100).toLocaleString("en-GB")}`;
}

export function duration(ms) {
  const mins = Math.max(0, Math.round(ms / 60000 / 5) * 5);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`;
}
