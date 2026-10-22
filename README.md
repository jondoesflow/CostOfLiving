# When's cheapest to run it?

Pick an appliance and find the cheapest time to run it on your electricity
tariff, with what it will cost.

- Tariffs: Agile Octopus, Octopus Go, Cosy Octopus, Economy 7 and standard/fixed
- Live half-hourly prices from Octopus Energy's public API (no key needed)
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
