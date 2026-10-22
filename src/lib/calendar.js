// Calendar events for "start it now" reminders: a downloadable .ics file, a
// Google Calendar link, and the address of the self-updating calendar feed.

// "Charge the electric car", "Switch on the heated airer", "Start the washing machine".
export function reminderTitle(name) {
  const thing = name.toLowerCase();
  if (/car|bike|scooter/.test(thing)) return `Charge the ${thing}`;
  if (/shower/.test(thing)) return "Time for your shower";
  if (/^iron$/.test(thing)) return "Do the ironing";
  if (/blanket|heater|airer|dehumidifier/.test(thing)) return `Switch on the ${thing}`;
  return `Start the ${thing}`;
}

const stamp = (t) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// Calendar text must escape commas, semicolons and backslashes.
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function icsEvent({ uid, start, end, title, description }) {
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
  ].join("\r\n");
}

export function icsCalendar(events, { name, refreshHours } = {}) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cheap Watts//EN",
    "CALSCALE:GREGORIAN",
    ...(name ? [`X-WR-CALNAME:${esc(name)}`] : []),
    ...(refreshHours ? [`REFRESH-INTERVAL;VALUE=DURATION:PT${refreshHours}H`, `X-PUBLISHED-TTL:PT${refreshHours}H`] : []),
    ...events.map(icsEvent),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadIcs(events, filename) {
  const blob = new Blob([icsCalendar([].concat(events))], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl({ start, end, title, description }) {
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${stamp(start)}/${stamp(end)}`, details: description });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// Address of the calendar feed served by netlify/functions/calendar.mjs.
export function feedUrl({ tariff, region, kWh, mins, name, e7 }) {
  const params = new URLSearchParams({ t: tariff, k: String(kWh), m: String(mins), n: name });
  if (region) params.set("r", region);
  if (tariff === "e7") {
    params.set("ns", e7.nightStart);
    params.set("ne", e7.nightEnd);
    params.set("dr", String(e7.dayRate));
    params.set("nr", String(e7.nightRate));
  }
  return `${window.location.origin}/calendar.ics?${params}`;
}
