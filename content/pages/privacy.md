---
title: Privacy policy
description: How the Cheap Watts iPhone app and website handle your data. No account, no adverts, no tracking in the app. Your settings stay on your device.
slug: privacy
---

_Last updated: 26 October 2026_

Cheap Watts helps you find the cheapest and greenest time to run your appliances. It is made by Jon Russell (JonDoesFlow). This policy covers the Cheap Watts iPhone app and the website at cheapwatts.co.uk.

## The short version

- No account, no sign-up, no email address.
- No adverts.
- The app has no analytics or tracking. The website counts visits with a cookie-less, self-hosted tool (see below).
- Your settings stay on your own device.
- The only things that leave your device are your tariff and region, sent to the public price and carbon APIs so we can show you prices, and your postcode when you ask us to find your region.

## The app

### What the app sends, and why

The app has no server of its own. To show prices, it asks the energy suppliers' public price APIs and National Grid's carbon forecast directly from your phone. Depending on your settings, a request contains:

| What's sent | Where | Why |
| --- | --- | --- |
| Your chosen tariff and region letter (one of 14 electricity regions) | Your supplier's public price API: Octopus Energy (api.octopus.energy), EDF (api.edfgb-kraken.energy) or E.ON Next (api.eonnext-kraken.energy) | To get the half-hourly prices for your tariff |
| Your region letter | Octopus Energy's public API (api.octopus.energy) | To get the standard electricity rate used for comparison, and the gas rate for the gas or electric comparison |
| Your region letter | National Grid ESO carbon intensity API (api.carbonintensity.org.uk) | To show the greenest time |
| A postcode, only when you tap Find | Octopus Energy's grid-supply-point lookup (api.octopus.energy) | To work out which electricity region you are in. The app does not store the postcode |

These services are run by third parties, not by us, and may keep routine technical logs (such as the request and your IP address) under their own privacy policies. If you use Economy 7 or another off-peak tariff with the times and rates typed in from your bill, no price request is made at all; the region is still sent to the carbon API if you have chosen one.

### Stored on your phone

The app remembers your supplier, tariff, region, cheap hours and rates, and any unit rate you type in, so you don't have to enter them again. They are saved on your phone only and never sent to us. Deleting the app deletes them.

### Reminders

If you tap Remind me, the app asks for permission to show notifications and schedules a reminder on your phone. Reminders are local notifications created and kept on the device; nothing is sent anywhere. You can say no, or change your mind later in your phone's Settings, and the rest of the app works without them.

### Links

Some rows on the About screen open websites (the suppliers, National Grid, the developer's site) in an in-app browser. Those sites have their own policies.

## The website

The website at cheapwatts.co.uk makes the same requests to the same price and carbon APIs, directly from your browser, for the same reasons. Your settings are saved in your browser's local storage and never sent to us.

The website counts visits with Umami, a privacy-friendly analytics tool self-hosted at umami.jondoesflow.com. It uses no cookies, stores no personal information and does not track you across sites. It records only aggregate figures such as page views, the page you came from, your browser type and country. The app does not use Umami or any other analytics.

The website's calendar feed and best-time links, for use with calendar apps and smart home systems, carry your tariff, region and appliance figures in the link itself. When your calendar or smart home system fetches the link, those figures reach the website's hosting (Netlify) so it can work out the best time. They are not stored by us and contain nothing that identifies you.

## Children

Cheap Watts doesn't knowingly collect any personal information from anyone, including children.

## Your rights and how to complain

Because we hold no personal information about you, there is nothing for us to give you, correct or delete. If you have a question or a concern about privacy, please get in touch at jon@jondoesflow.com. If you are in the UK and are unhappy with how we have handled it, you can complain to the Information Commissioner's Office (ICO) at ico.org.uk.

## Changes and contact

If this policy changes, the new version will be published at https://cheapwatts.co.uk/privacy/ with a new date.

Questions: jon@jondoesflow.com
