# App Review information (Cheap Watts)

Paste into App Store Connect > App Review Information > Notes (4,000 characters max; count it),
and reuse as the reply if Apple asks for a screen recording and numbered answers. Items marked
[CHECK] need Jon's confirmation.

## The screen recording (Jon does this, only if Apple asks)

1. Update the iPhone to the latest iOS.
2. Settings > Control Centre > add Screen Recording.
3. Start recording from the Home Screen, then tap the app icon so the launch is on video.
4. Walk the typical flow, 1 to 2 minutes: My tariff (choose a supplier, tariff and region, try
   the postcode Find), Cheapest time with an appliance, Plan evening, Gas or electric, then
   About (privacy section and the Full privacy policy link). There is no login, account deletion,
   user content or paid content to show.
5. Stop; the video is in Photos. Attach it to the reply.

## Reply text

```
1. SCREEN RECORDING
Attached: recorded on an [CHECK: iPhone model] running the latest iOS, starting from launching the app. The app has no account registration or login, no user-generated content and no paid content or features.

2. PURPOSE AND AUDIENCE
Cheap Watts helps people in the UK run their appliances when electricity is cheapest and greenest. Many UK tariffs now charge different prices at different times of day (Agile Octopus changes every half hour; Economy 7 and EV tariffs have cheap overnight hours), but it is hard to know when the cheap slot is. The app reads the published prices for the user's tariff and region and shows the cheapest half hour to start a washing machine, dishwasher, tumble dryer or car charger, plans an evening of jobs around the cheap hours, and compares gas with electricity for cooking and heating. It is free, with no account, adverts or in-app purchases. Audience: UK households on a time-of-use or off-peak electricity tariff, and anyone curious about running costs.

3. HOW TO USE IT
No login or sample files are needed.
- My tariff tab: choose a supplier (for example Octopus Energy) and a tariff (for example Agile Octopus). Choose a region from the list, or type any UK postcode such as SW1A 1AA and tap Find. For "Economy 7 or another off-peak tariff", type cheap hours and rates (the defaults work). For "Standard or fixed", the typical rate is filled in.
- Cheapest time tab: pick an appliance, for example Washing machine, to see the cheapest start time, its cost and the greenest time. "Remind me" asks for notification permission and schedules a local reminder; the app works without it.
- Plan evening tab: add two or three appliances to get a start time for each.
- Gas or electric tab: compare cooking and heating costs using the rates from My tariff.
- About (from My tariff > About Cheap Watts): privacy information and a link to the full privacy policy at https://cheapwatts.co.uk/privacy/.

4. EXTERNAL SERVICES
- Octopus Energy public API (api.octopus.energy): tariff prices, the standard rate used for comparison, the gas rate, and the postcode-to-region lookup used by the Find button. Accessed directly from the app, no key.
- EDF public API (api.edfgb-kraken.energy) and E.ON Next public API (api.eonnext-kraken.energy): tariff prices for those suppliers' customers. Accessed directly, no key.
- National Grid ESO carbon intensity API (api.carbonintensity.org.uk): the regional carbon forecast for the greenest time. Accessed directly, no key.
- Apple local notifications: reminders scheduled on the device. No push notification service.
No authentication, payment, analytics, advertising or AI services are used.

5. REGIONAL DIFFERENCES
The app covers the United Kingdom only, because the tariffs, the 14 electricity regions and the carbon forecast are all for Great Britain. It is offered on the UK App Store and works the same way throughout the UK. [CHECK: matches Pricing and Availability]

6. REGULATION AND THIRD-PARTY MATERIAL
The app is not in a regulated industry and gives no financial or energy advice; it shows published prices and estimates. Tariff prices are read from the suppliers' public, keyless APIs, which the suppliers publish for third-party use. The carbon forecast is published by National Grid ESO under the CC BY 4.0 licence (carbonintensity.org.uk). [CHECK: licence terms current] The app is independent and not affiliated with any energy supplier.
```

Before sending, check: the device model matches the recording, the countries in point 5 match
Pricing and Availability, and the character count is under 4,000.
