# Cheap Watts

Free tools to help UK households spend less on electricity. Live at
https://cheapwatts.co.uk (sister site to [Cheap Pumps](https://cheappumps.co.uk))

- **When to run**: pick an appliance, get the cheapest (and greenest) time to
  run it, with delay-timer settings and calendar reminders, including a
  calendar feed that keeps moving the reminder as prices change
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

## Run it locally

Needs Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173/). The calendar
feed is a Netlify Function (`netlify/functions/calendar.mjs`); run
`npx netlify dev` instead to try it locally.

## Build

```bash
npm run build
```

The site builds to `dist/`. `netlify.toml` holds the Netlify build settings.
