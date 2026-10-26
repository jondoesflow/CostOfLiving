import {
  APPLIANCES,
  SITE_URL,
  SLOT_MS,
  bestWindows,
  cheapestSlots,
  duration,
  money,
  nearPeak,
  pricesPending,
  profileOf,
  timeLabel,
  ukMinutes,
  whenLabel,
  windowCosts,
  type Appliance,
  type Best,
  type ChargePlan,
  type Slot,
  type Tariff,
  type Window,
} from '../shared';

// Everything the "Cheapest time" screen derives from its inputs, as pure functions, so the
// route stays thin and the rules can be tested. The maths itself is the website's (optimise.js);
// this file only decides what to ask it and how to word the answer, as src/tools/WhenToRun.jsx does.

export const WAITS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
] as const;
export type WaitValue = (typeof WAITS)[number]['value'];

/** Grams of CO2, as "640g" or "1.2kg". */
export function grams(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(1)}kg` : `${Math.round(g)}g`;
}

/** "3.5kWh", trimmed to one decimal. */
export const kwhLabel = (n: number) => `${Number(n.toFixed(1))}kWh`;

/** Hourly finish times the run could meet with the prices on hand. */
export function finishOptions(slots: Slot[], mins: number | null, now: number): number[] {
  if (!slots.length || !mins) return [];
  const earliest = now + mins * 60000;
  const last = slots[slots.length - 1].start + SLOT_MS;
  const out: number[] = [];
  for (const s of slots) {
    const t = s.start + SLOT_MS;
    if (t >= earliest && t <= last && t % 3600000 === 0) out.push(t);
  }
  return out;
}

/** Run time in hours for the field, from minutes. */
export const hoursFromMins = (mins: number | null): number | null => (mins == null ? null : Number((mins / 60).toFixed(2)));
export const minsFromHours = (hours: number | null): number | null => (hours == null ? null : Math.round(hours * 60));

/** "Charge the electric car", "Switch on the heated airer", "Start the washing machine". Same as the website's lib/calendar.js. */
export function reminderTitle(name: string): string {
  const thing = name.toLowerCase();
  if (/car|bike|scooter/.test(thing)) return `Charge the ${thing}`;
  if (/shower/.test(thing)) return 'Time for your shower';
  if (/^iron$/.test(thing)) return 'Do the ironing';
  if (/blanket|heater|airer|dehumidifier/.test(thing)) return `Switch on the ${thing}`;
  return `Start the ${thing}`;
}

export interface WhenInput {
  applianceId: string | null;
  kWh: number | null;
  mins: number | null;
  finishBy: number | null;
  upAt: number | null;
  /** Minutes the finished run can wait before they're up. */
  wait: number;
  slots: Slot[];
  carbon: Slot[];
  ready: boolean;
  now: number;
  tariffInfo: Tariff | undefined;
}

export interface Green {
  result: Best;
  costAt: (start: number) => number | null;
}

export interface WhenModel {
  appliance: Appliance | undefined;
  finishOptions: number[];
  activeFinishBy: number | null;
  activeUpAt: number | null;
  latest: number | null;
  notBefore: number | null;
  valid: boolean;
  /** undefined: nothing to show yet; null: no window fits. */
  result: Best | null | undefined;
  cheapestAny: Window | null;
  pending: boolean;
  plan: ChargePlan | null;
  green: Green | null;
  soFar: boolean;
  summary: string;
}

/** The website's WhenToRun derivation, in one call. */
export function whenModel(input: WhenInput): WhenModel {
  const { applianceId, kWh, mins, finishBy, upAt, wait, slots, carbon, ready, now, tariffInfo } = input;
  const options = finishOptions(slots, mins, now);
  const appliance = APPLIANCES.find((a) => a.id === applianceId);
  // Drop a deadline that is no longer on offer (e.g. after changing tariff).
  const activeFinishBy = finishBy && options.includes(finishBy) ? finishBy : null;
  const activeUpAt = upAt && options.includes(upAt) && !appliance?.splittable ? upAt : null;
  // Ready when they're up: finished by then, but not long before.
  const latest = activeUpAt && activeFinishBy ? Math.min(activeUpAt, activeFinishBy) : (activeUpAt ?? activeFinishBy);
  const notBefore = activeUpAt ? activeUpAt - wait * 60000 : null;
  const profile = profileOf(applianceId);
  const valid = Boolean(applianceId && kWh && kWh > 0 && mins && mins > 0);

  const result = ready && valid ? bestWindows(slots, kWh!, mins!, latest, { notBefore, profile }) : undefined;
  // The cheapest time with no wake-up time, to show what being ready costs.
  const cheapestAny = ready && valid && activeUpAt ? (bestWindows(slots, kWh!, mins!, activeFinishBy, { profile })?.best ?? null) : null;
  // Tomorrow's prices on a dynamic tariff aren't published until the afternoon.
  const pending = ready && pricesPending(tariffInfo, slots, now);
  // Car charging can stop and start, so it goes into the cheapest half hours.
  const plan =
    ready && valid && appliance?.splittable && !result?.allSame
      ? cheapestSlots(slots, kWh!, mins!, { finishBy: activeFinishBy, cheapOnly: pending })
      : null;

  // Same search over the carbon forecast, with grams of CO2 in place of pence.
  let green: Green | null = null;
  if (valid && carbon.length) {
    const greenResult = bestWindows(carbon, kWh!, mins!, latest, { notBefore, profile });
    if (greenResult) {
      const all = windowCosts(carbon, kWh!, mins!, null, profile);
      green = { result: greenResult, costAt: (start) => all.find((w) => w.start === start)?.cost ?? null };
    }
  }

  const soFar = Boolean(result && pending && !result.allSame && nearPeak(slots, result.best));

  return {
    appliance,
    finishOptions: options,
    activeFinishBy,
    activeUpAt,
    latest,
    notBefore,
    valid,
    result,
    cheapestAny,
    pending,
    plan,
    green,
    soFar,
    summary: summaryText({ plan, result, activeUpAt, activeFinishBy, soFar }),
  };
}

/** The one-line summary read out to screen readers. */
export function summaryText({
  plan,
  result,
  activeUpAt,
  activeFinishBy,
  soFar,
}: {
  plan: ChargePlan | null;
  result: Best | null | undefined;
  activeUpAt: number | null;
  activeFinishBy: number | null;
  soFar: boolean;
}): string {
  if (plan) {
    const n = plan.sessions.length;
    return `${plan.startsNow ? 'Start charging now' : `Start charging at ${whenLabel(plan.sessions[0].start)}`}, in ${n} ${n === 1 ? 'spell' : 'spells'}. Cost ${money(plan.cost)}, or ${money(plan.nowCost)} if you charge straight away.`;
  }
  if (result === null) {
    return activeUpAt
      ? "It can't be ready by then with the prices we have."
      : activeFinishBy
        ? "There isn't enough time to finish by then."
        : 'Not enough prices ahead for a run this long yet.';
  }
  if (!result) return '';
  if (result.allSame) return `Any time costs the same. Each run costs about ${money(result.best.cost)}.`;
  return `${soFar ? 'Cheapest so far: ' : ''}${result.best.index === 0 ? 'Start it now' : `Start at ${whenLabel(result.best.start)}`}. Cost then ${money(result.best.cost)}, or ${money(result.now.cost)} if you start it now.`;
}

/** The warning shown when no window fits. */
export function noResultText(upAt: number | null, finishBy: number | null): string {
  if (upAt) return "It can't be ready by then with the prices we have. Choose a later time, or let it wait longer.";
  if (finishBy) return "There isn't enough time to finish by then. Choose a later time.";
  return "We don't have prices far enough ahead for a run this long yet. Try again in the afternoon, when tomorrow's prices come out.";
}

/** The "Tomorrow's prices aren't out yet" banner text. */
export function pendingText(tariffInfo: Tariff | undefined, tariff: string, slots: Slot[]): string {
  const until = slots[slots.length - 1].start + SLOT_MS;
  const when = tariff === 'agile' ? "Octopus publishes the next day's prices around 4pm" : "The next day's prices usually come out in the afternoon";
  return `We only have ${tariffInfo?.label ?? 'tariff'} prices up to ${timeLabel(until)} tonight. ${when}, and overnight is often cheaper, so check back then before planning anything for tonight.`;
}

/** Heading, tagline and "ready/finishes" line for a window result. */
export function resultHeading(result: Best, soFar: boolean, upAt: number | null): { eyebrow: string; title: string; finish: string } {
  const { best } = result;
  const startNow = best.index === 0;
  return {
    eyebrow: soFar ? 'Cheapest so far' : 'Cheapest time',
    title: soFar ? `Cheapest so far: ${startNow ? 'now' : whenLabel(best.start)}` : startNow ? 'Start it now' : `Start at ${whenLabel(best.start)}`,
    finish: `${upAt ? 'Ready' : 'Finishes'} around ${whenLabel(best.end)}.`,
  };
}

/** What being ready when they're up costs against the cheapest time, or null when it is the cheapest. */
export function readyComparison(best: Window, cheapestAny: Window | null): string | null {
  if (!cheapestAny || cheapestAny.start === best.start) return null;
  const extra = best.cost - cheapestAny.cost;
  return extra > 0.05
    ? `That's ${money(extra)} more than the cheapest time, which finishes at ${whenLabel(cheapestAny.end)}, so you're not paying much to avoid it sitting there.`
    : `That costs the same as the cheapest time, which finishes at ${whenLabel(cheapestAny.end)}.`;
}

export const SO_FAR_TEXT =
  "That's in or just after the 4pm to 7pm peak, only because later prices aren't published yet. If it can wait, check back once tomorrow's prices are out: overnight is usually cheaper.";

/** "Waiting saves 12p, about £24 a year if you run it 4 times a week and prices stay like today." */
export function savingText(saveNow: number, perWeek: number, yearly: boolean, verb: 'run' | 'charge'): string | null {
  if (saveNow <= 0.05) return null;
  const year = yearly && perWeek > 0 ? `, about ${money(saveNow * perWeek * 52)} a year if you ${verb} it ${perWeek} times a week and prices stay like today` : '';
  return `Waiting saves ${money(saveNow)}${year}.`;
}

/** The standard tariff comparison line, or null when it isn't worth showing. */
export function standardTariffText(kWh: number, refRate: number | null, tariff: string, bestCost: number): string | null {
  if (refRate == null || tariff === 'flat') return null;
  const refCost = kWh * refRate;
  if (Math.abs(refCost - bestCost) <= 0.05) return null;
  return `On a standard tariff in your region it would cost ${money(refCost)} at any time of day.`;
}

/** The delay timer text, and whether to warn that most timers stop at 24 hours. */
export function timerText(best: Window, now: number): { text: string; over24h: boolean } {
  const finishIn = best.end - now;
  return {
    text: `Set it to start in ${duration(best.start - now)}, or if your machine counts down to the end, finish in ${duration(finishIn)}.`,
    over24h: finishIn > 24 * 3600 * 1000,
  };
}

export function soonerText(sooner: Window): string {
  return `The cheapest earlier time is ${sooner.index === 0 ? 'now' : whenLabel(sooner.start)}, for about ${money(sooner.cost)}.`;
}

/** The share message for a window result. */
export function shareText(result: Best, applianceName: string, perWeek: number): string {
  const saveNow = result.now.cost - result.best.cost;
  const thing = applianceName.toLowerCase();
  return !result.allSame && saveNow > 0.05 && perWeek > 0
    ? `Running my ${thing} at ${whenLabel(result.best.start)} instead of now saves ${money(saveNow)}, about ${money(saveNow * perWeek * 52)} a year. Find the cheapest time to run yours, free:`
    : 'Find the cheapest and greenest time to run your appliances on your electricity tariff, free:';
}

/** The share message for a car charging plan. */
export function chargeShareText(plan: ChargePlan, perWeek: number): string {
  const partial = plan.remaining > 0.05;
  const saveNow = plan.nowCost - plan.cost;
  return !partial && saveNow > 0.05 && perWeek > 0
    ? `Charging my car in the cheapest half hours instead of straight away saves ${money(saveNow)}, about ${money(saveNow * perWeek * 52)} a year. Find yours, free:`
    : 'Find the cheapest and greenest time to run your appliances on your electricity tariff, free:';
}

export const SHARE_URL = `${SITE_URL}/?utm_source=app&utm_medium=share&utm_campaign=when`;
export const shareMessage = (text: string) => `${text} ${SHARE_URL}`;

/** Wording for the greenest time box, or null when there's no carbon forecast. */
export function greenestText(green: Green | null, cheapest: Window | null, allSame: boolean): { title: string; body: string } | null {
  if (!green) return null;
  const { best, now } = green.result;
  const atCheapest = cheapest && !allSame ? green.costAt(cheapest.start) : null;
  const sameTime = atCheapest != null && atCheapest - best.cost <= Math.max(20, best.cost * 0.15);
  let body = `About ${grams(best.cost)} of CO₂, against ${grams(now.cost)} if you start it now.`;
  if (sameTime) body += ' Good news: your cheapest time is about as green.';
  else if (atCheapest != null) body += ` Your cheapest time would be about ${grams(atCheapest)}.`;
  return { title: `Greenest time: ${best.index === 0 ? 'now' : whenLabel(best.start)}`, body };
}

/** Car charging wording. */
export function chargeHeading(plan: ChargePlan): { title: string; finish: string } {
  const first = plan.sessions[0];
  const done = plan.sessions[plan.sessions.length - 1].end;
  return {
    title: plan.startsNow ? 'Start charging now' : `Start charging at ${whenLabel(first.start)}`,
    finish: plan.sessions.length > 1 ? `Charge in ${plan.sessions.length} spells, finishing around ${whenLabel(done)}.` : `Finishes around ${whenLabel(done)}.`,
  };
}

export function chargePartialText(plan: ChargePlan, kWh: number, pending: boolean, finishBy: number | null): string | null {
  if (plan.remaining <= 0.05) return null;
  const covers = `That covers ${kwhLabel(plan.placed)} of the ${kwhLabel(kWh)}.`;
  return pending
    ? `${covers} Leave the other ${kwhLabel(plan.remaining)} until tomorrow's prices are out, when the cheapest overnight hours can be picked.`
    : `${covers} The other ${kwhLabel(plan.remaining)} doesn't fit ${finishBy ? 'before your finish time' : 'in the hours we have prices for'}.`;
}

export function chargeSessionLabel(s: { index: number; start: number; end: number; kWh: number; cost: number }): { when: string; amount: string } {
  return { when: `${s.index === 0 ? 'Now' : whenLabel(s.start)} to ${timeLabel(s.end)}`, amount: `${kwhLabel(s.kWh)}, ${money(s.cost)}` };
}

export function chargeAppText(plan: ChargePlan, now: number): string {
  const first = plan.sessions[0];
  const delay = plan.startsNow ? '' : `, or set it to start in ${duration(first.start - now)}`;
  return `Set these times in your car's or charger's app${delay}. If your charger has a smart or Agile mode, it can pick the cheap half hours for you.`;
}

/** Bars for the price chart: one per half hour, with the highlighted windows marked. */
export interface ChartBar { start: number; value: number; highlighted: boolean }
export function chartBars(slots: Slot[], highlights: { from: number; count: number }[], max = 48): ChartBar[] {
  return slots.slice(0, max).map((s, i) => ({
    start: s.start,
    value: Number(s.price.toFixed(2)),
    highlighted: highlights.some((h) => i >= h.from && i < h.from + h.count),
  }));
}

/** Axis labels every 6 hours on the clock, with the bar index each one sits under. */
export function chartTicks(bars: ChartBar[]): { index: number; label: string }[] {
  const out: { index: number; label: string }[] = [];
  bars.forEach((b, index) => {
    const m = ukMinutes(b.start);
    if (m % 360 !== 0) return;
    out.push({ index, label: m === 0 ? '12am' : m === 720 ? '12pm' : timeLabel(b.start) });
  });
  return out;
}
