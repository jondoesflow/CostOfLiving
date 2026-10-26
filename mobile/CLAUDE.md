@AGENTS.md

# Cheap Watts app

The iPhone app for https://cheapwatts.co.uk. It shares the price fetching, the cheapest-time
maths and the appliance figures with the website (../src, via metro.config.js watchFolders and
the .d.ts files beside each shared module), so the app and the site always agree. Change the
maths in ../src, never here.

- Screens live in src/app (expo-router); everything else in src/components, src/lib, src/theme.
- Settings (supplier, tariff, region, off-peak hours) are kept on the device by src/lib/electricity.tsx.
- No account, no adverts, no analytics, no tip links (Apple rejects them). Reminders are local notifications.
- Run `npm run typecheck`, `npm test` and `npm run lint` before declaring any task done.
- Store paperwork is in store/. The public privacy policy is the website's content/pages/privacy.md.
