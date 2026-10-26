# Cheap Watts for iPhone

The native app for [cheapwatts.co.uk](https://cheapwatts.co.uk): the cheapest and greenest time
to run your appliances on your electricity tariff, a planner for the evening's washing, dishes
and car charging, and gas-or-electric comparisons. Built with Expo and React Native; it shares
its maths and price data code with the website in `../src`.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on an iPhone (same SDK version). The real iOS look is
only seen in TestFlight or a development build; the web preview shows the Android styling.

## Check it

```bash
npm run typecheck
npm test
npm run lint
npx expo-doctor
```

## Build and publish

See `../.claude` skills or `store/listing.md` for the App Store steps. Builds run in the cloud with
EAS (`npx eas-cli@latest build --platform ios --profile production`), no Mac needed.
