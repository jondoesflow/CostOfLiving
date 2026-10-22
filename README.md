# When's cheapest to run it?

Pick an appliance and find the cheapest time to run it on your electricity
tariff, with what it will cost.

- Live prices for Octopus (Agile, Go, Cosy), EDF (FreePhase Dynamic, GoElectric)
  and E.ON Next (Next Drive), from their public Kraken price APIs (no key needed)
- Any supplier: Economy 7 or other off-peak tariffs with your own hours and
  rates, and standard/fixed tariffs
- Shows the cheapest start time, the cost versus starting now, delay-timer
  settings and a price chart

## Run it locally

Needs Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173/).

## Build

```bash
npm run build
```

The site is static and builds to `dist/`. `netlify.toml` holds the Netlify
build settings.
