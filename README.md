# Cheap Watts

Free tools to help UK households spend less on electricity. Live at
https://cheapwatts.co.uk (sister site to [Cheap Pumps](https://cheappumps.co.uk))

- **When to run**: pick an appliance, get the cheapest (and greenest) time to
  run it, with delay-timer settings and calendar reminders, including a
  calendar feed that keeps moving the reminder as prices change. It can
  have things ready when you get up rather than hours before, splits car
  charging into the cheapest half hours, and says when tomorrow's Agile
  prices aren't out yet
- **Plan my evening**: fit several appliances into the cheapest hours, with a
  limit on how many run at once
- **Gas or electric?**: kettle or hob, heater or central heating, and more,
  at today's prices
- **Solar & batteries**: use or sell your solar, and when to charge and empty
  a home battery
- **Should I switch?**: cost your own half-hourly usage file on every tariff
  (read in the browser, never uploaded)

## Data

- Live prices for Octopus (Agile, Go, Cosy), EDF (FreePhase Dynamic, GoElectric)
  and E.ON Next (Next Drive), from their public Kraken price APIs (no key needed)
- Any supplier: Economy 7 or other off-peak tariffs with your own hours and
  rates, and standard/fixed tariffs
- Export prices: Agile Outgoing and Outgoing Octopus
- Carbon: National Grid ESO regional carbon intensity forecast

## Smart home and Home Assistant

Two links give the cheapest time to anything that can read them, with no
account. The guide is at https://cheapwatts.co.uk/smart-home/ (source:
`content/pages/smart-home.md`).

- `/calendar.ics?t=agile&r=M&k=0.8&m=120&n=Washing%20machine&a=washer`: a
  calendar feed with the next cheapest run (`netlify/functions/calendar.mjs`)
- `/api/best-time?t=agile&r=M&k=0.8&m=120&a=washer`: the same as JSON, with
  optional `by=07:00` (finish by), `up=07:00` and `wait=60` (ready when you're
  up, but no more than that many minutes before) (`netlify/functions/best-time.mjs`)

`t` is the tariff, `r` the region letter, `k` kWh per run, `m` minutes per run
and `a` the appliance, which sets when in the run it uses its power. The
parameters are read in `src/lib/feedRequest.js`.

## How it works

The logic has no dependencies beyond plain JavaScript, so it can be reused or
ported, for example to run locally in Home Assistant.

- `src/prices.js`: fetches half-hourly prices from the suppliers' public
  Kraken APIs (`https://api.octopus.energy/v1/...` and the EDF and E.ON Next
  equivalents) and builds Economy 7 style prices from your own hours
- `src/optimise.js`: the maths. `bestWindows` finds the cheapest start time,
  with optional finish-by and ready-from limits; `cheapestSlots` splits
  charging across the cheapest half hours; `scheduleJobs` plans several
  appliances at once
- `src/appliances.js`: typical figures for each appliance, and the energy
  patterns (washing machines use most of their power heating water at the
  start)
- `src/lib/flexible.js`: finds car charging in a usage file, so "Should I
  switch?" can re-time it for each tariff

## Feedback and contributions

Ideas, bug reports and pull requests are welcome: open an issue on GitHub.
Several features came straight from people's feedback.

## Run it locally

Needs Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173/). The calendar
feed and best-time link are Netlify Functions in `netlify/functions/`; run
`npx netlify dev` instead to try them locally.

## Build

```bash
npm run build
```

The site builds to `dist/`. `netlify.toml` holds the Netlify build settings.

## Tests

```bash
npx playwright test
```

Playwright runs every tool on a phone and a desktop against mocked price APIs,
including WCAG 2.2 AA accessibility checks in light and dark mode.

## Licence

MIT. See [LICENSE](LICENSE). Use it, change it and build on it; a link back to
https://cheapwatts.co.uk is appreciated but not required.
