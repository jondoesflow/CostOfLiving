# Store listing: Cheap Watts

Drafts for App Store Connect. Character limits are the App Store's as of October 2026; count
before handing over. Every claim must be true of the app. Items marked [CHECK] need Jon's
confirmation before submitting.

| Field | Text | Limit |
| --- | --- | --- |
| App name | Cheap Watts: Electricity Times | 30 |
| Subtitle | Cheapest time to run things | 30 |
| Keywords (comma separated, don't repeat words from the name) | agile,octopus,tariff,economy 7,off-peak,energy,washing,dishwasher,charger,carbon,gas,cost,uk | 100 |
| Promotional text (editable any time, no review) | Find the cheapest half hour to run the washing, dishwasher or car charger on your tariff. Free, no account, no adverts. | 170 |
| Support URL | https://cheapwatts.co.uk/ | |
| Marketing URL (optional) | https://cheapwatts.co.uk/ | |
| Privacy policy URL | https://cheapwatts.co.uk/privacy/ | |
| Copyright | 2026 Jon Russell | |
| Primary / secondary category | Utilities / Lifestyle [CHECK: secondary is optional; leave blank if unsure] | |
| Price | Free. No in-app purchases. No tip or donation link (Apple guideline 3.1.1). | |
| Countries | United Kingdom [CHECK: the suppliers, regions and carbon data are UK only, so the UK store alone is the honest choice] | |
| Bundle ID | uk.co.cheapwatts.app | |
| Devices | iPhone only (`supportsTablet: false`) | |

## Description (up to 4,000 characters)

Find the cheapest and greenest time to run your washing machine, dishwasher, tumble dryer or
electric car charger on your own electricity tariff.

Free to use. No account, no sign-up, no adverts, no tracking.

CHEAPEST TIME
- Pick an appliance and see the cheapest half hour to start it in the next day or two
- See how much it costs, and how much you save against the standard rate
- See the greenest time too, using the National Grid carbon forecast for your region
- Set a reminder so your phone tells you when to press start

PLAN AN EVENING
- Add the jobs you want to do tonight and get a start time for each one
- The app fits them around your cheap hours so they don't clash

GAS OR ELECTRIC
- Compare what cooking, heating water or warming a room costs on gas and on electricity, using
  your own unit rates

MY TARIFF
- Works with Agile Octopus, Octopus Go, Cosy Octopus, EDF FreePhase Dynamic and GoElectric, and
  E.ON Next Drive, with live prices from the suppliers' public price APIs
- On Economy 7 or another off-peak tariff with any supplier? Type in your cheap hours and rates
  from your bill
- On a standard or fixed tariff? Use the typical rate for your region, or type in your own

Your settings are saved on your phone only. Nothing is sent to us.

Cheap Watts is the app version of cheapwatts.co.uk. Costs are estimates based on typical
appliance figures and the prices published for your tariff, so always check your own bill.
Cheap Watts is independent and not affiliated with any energy supplier.

[CHECK: the feature lines above describe what the other screens are planned to do. Tick each
one off against the finished app before submitting, and delete anything that isn't in the build.]

## Age rating

Answer the questionnaire honestly. A utility with no objectionable content: None / No throughout,
which gives 4+. The About screen opens external sites (the suppliers, National Grid,
jondoesflow.com) in an in-app browser, so if the questionnaire asks about unrestricted web
access, answer "No": the app only opens a fixed set of links, not a general browser.

- Made for Kids: No.
- Gambling, contests, medical, alcohol, violence, horror, profanity, sexual content: None.
- Unrestricted web access: No.

## App Privacy (Apple)

"Data Not Collected" is NOT accurate for this app, because the chosen region letter, tariff id
and (when the user taps Find) a postcode leave the device and go to third-party APIs, and those
hosts may keep routine technical logs. Declare:

- Choose "Yes, we collect data from this app".
- **Location > Coarse Location**: purpose **App Functionality**; **not linked** to the user's
  identity; **not used for tracking**. This covers the electricity region (one of 14 areas of
  Great Britain) sent to the price and carbon APIs, and the postcode sent to Octopus Energy's
  grid-supply-point lookup when the user taps Find. [CHECK: this follows the same reasoning as
  the Cheap Pumps listing; confirm you are happy with it.]
- Nothing else. There is no account, no contact details, no identifiers, no usage data, no
  diagnostics collected by the app, and no advertising.
- Tracking: **No**, the app does not track users.
- Reminders are local notifications created on the device; no push service is used, so nothing
  to declare there.

If Jon would rather not declare location at all, the alternative is to make the About screen and
privacy policy the only statement and pick "Data Not Collected", but the template's guidance is
that this is only safe when nothing leaves the device and the hosts keep no logs, which cannot
be guaranteed for Octopus, EDF, E.ON Next or National Grid. Recommended: declare Coarse Location.

## Screenshots (in order)

iPhone 6.9" display set (1320 x 2868 portrait), light mode, from a TestFlight build on a real
device or the simulator. App Store Connect scales this set for smaller phones. No iPad
screenshots are needed (iPhone only).

Use a realistic setup: supplier Octopus Energy, tariff Agile Octopus, region London, so the
price charts have real shape. Take them on a weekday afternoon once tomorrow's Agile prices
are published, so the cheapest slot is overnight and the saving is visible.

| # | Screen | Headline | Sub-line |
| --- | --- | --- | --- |
| 1 | Cheapest time result (washing machine, Agile) | Run it when it's cheapest | The cheapest half hour on your tariff, and what it costs |
| 2 | Cheapest time with the greenest time shown | Cheapest and greenest | National Grid's carbon forecast for your region |
| 3 | Plan evening with three jobs placed | Plan the whole evening | A start time for every job, fitted around your cheap hours |
| 4 | Gas or electric comparison | Gas or electric? | Compare cooking and heating costs on your own rates |
| 5 | My tariff (Economy 7 fields filled in) | Any supplier, any tariff | Live prices for Octopus, EDF and E.ON Next, or type in your own |
| 6 | Reminder set (Remind me confirmation) | Never miss the cheap slot | A reminder on your phone when it's time to press start |

[CHECK: screens 1 to 4 and 6 depend on the other screens being finished. Drop any that aren't.]

## App Review notes

See store/app-review-notes.md for the full text to paste into App Review Information > Notes.
Short version:

No login is required. Open the My tariff tab, choose Octopus Energy and Agile Octopus, then
choose a region from the list or type any UK postcode such as SW1A 1AA and tap Find. The other
tabs then show the cheapest time to run an appliance, an evening plan, and a gas or electric
comparison. Notification permission is only asked for if you tap Remind me; the app works without
it. Prices come from the suppliers' public price APIs (api.octopus.energy,
api.edfgb-kraken.energy, api.eonnext-kraken.energy) and the National Grid ESO carbon intensity
API (api.carbonintensity.org.uk), all accessed directly from the app with no key.
