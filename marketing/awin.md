# Awin affiliate links

Cheap Watts' Awin publisher account is EmpowerInsightLtd, publisher id
3143222. The "Worth a look" picks in `src/products.js` that have an `awin`
entry switch from Amazon to the retailer's own site once that programme has
approved us. Until then they keep using Amazon, so nothing breaks while an
application is pending.

## Programmes to join

Join each one in Awin (Advertisers > Join Programmes, or the profile link
below). Each advertiser approves applications themselves.

| Pick on the site | Programme | Awin id | Profile |
|---|---|---|---|
| EcoFlow portable power station | EcoFlow UK (rejected 5 Nov 2026, see Rejections) | 51797 | https://ui.awin.com/merchant-profile/51797 |
| Anker SOLIX portable power station | Anker UK | 36326 | https://ui.awin.com/merchant-profile/36326 |
| Dehumidifier with a laundry mode | Meaco UK | 31711 | https://ui.awin.com/merchant-profile/31711 |
| Heated airer with a cover | Lakeland | 1751 | https://ui.awin.com/merchant-profile/1751 |
| Electric blanket or heated throw | Dimplex UK | 130445 | https://ui.awin.com/merchant-profile/130445 |
| Air fryer, slow cooker | Tower Housewares | 20823 | https://ui.awin.com/merchant-profile/20823 |

Worth considering later, not wired in yet: AO.com (19526) and Currys (1599)
for heat pump tumble dryers, and tado (24881) for smart thermostats. Their
sites block automated checks, so landing pages need checking by hand first.
Meross (107077) sells from a US store in dollars, so it doesn't suit UK
readers.

## Approved programmes

| Programme | Awin id | Approved | Terms | Where it appears |
|---|---|---|---|---|
| Simply LED | 5190 | 3 Nov 2026 | [5190-simply-led.md](awin-terms/5190-simply-led.md) | `/cost-to-run/lights/`, the LED bulbs pick (`led-bulbs`), the LED blog post |
| Tower Housewares | 20823 | 5 Nov 2026 | Terms PDF still to read (approval email: up to 6% commission, 30-day cookie) | Air fryer and slow cooker gift page (5 products), the `airfryer` and `slowcooker` picks on the oven, air fryer and slow cooker running-cost pages and blog posts |
| Swan Products | 16860 | 6 Nov 2026 | Terms PDF still to read (approval email: 10% commission on all products) | Three Swan products on the air fryer and slow cooker gift page (Nordic Duo air fryer, 1.5 and 6.5 litre slow cookers) |
| Meaco | 31711 | 6 Nov 2026 | Terms PDF still to read | The `dehumidifier` pick (Meaco's dehumidifiers page): heated airer and dehumidifier running-cost pages, the heated airer v tumble dryer post, and the tool's results for those appliances |
| Meross Smarthome | 107077 | 11 Nov 2026 | Terms PDF still to read | The `monitor-plug` pick (Meross MSS315MA UK smart plug with energy monitor, 2-pack), shown on about 17 running-cost pages, the planner and blog posts. Its shop lists prices in US dollars, so no price is recorded; the gift guide still uses the TP-Link Tapo P110 |

## When an advertiser approves Cheap Watts (do this every time)

1. **Spot it.** Awin emails jon@jondoesflow.com from no-reply@awin.com when a
   programme approves or rejects us. A rejection gives the reason; log it below
   and fix the site if the reason is about the site.
2. **Read the terms before linking.** The terms PDF is at
   `https://ui.awin.com/awin/affiliate/3143222/merchant-profile-terms/<id>/download-terms-pdf?locale=en_US`
   and needs Jon's Awin login, so Jon's Cowork downloads it into OneDrive
   (`Cheap Watts/Awin terms/`). Summarise it in `marketing/awin-terms/<id>-<name>.md`:
   whether editorial content and direct linking are allowed, the commission
   basis, paid search and discount code rules, brand guidelines. Stop and ask
   Jon if content sites or direct links aren't allowed.
3. **Pick products that fit a page we have.** Two to six products from the
   retailer's own site that match an existing page (running costs, gift guide,
   a blog post). Record every figure from the product page with its source URL
   and `lastChecked` date: power, price in whole pence, pack size. Anything the
   page doesn't state is null and listed as a TODO, never guessed.
4. **Wire it in.** Add the id to `src/awinJoined.js`, give the products their
   `awin` entry (`{ mid, retailer, url }`) in the right data file
   (`src/products.js`, `src/giftProducts.js`, `src/lightingProducts.js`), and
   add a "Worth a look" pick where a post or page should carry it. Links go
   through `src/affiliateLink.js`, which adds the clickref, `rel="sponsored nofollow"`
   and the new tab.
5. **Give it a page if none fits.** A running-cost page or gift page section
   when the product has a running cost to show; otherwise a blog topic at the
   top of `content/blog/TOPICS.md`, or a post written now under the blog
   workflow in CLAUDE.md.
6. **Check and raise a PR.** `npm run lint`, `npm run test:unit`,
   `npm run build`, `npx playwright test`. One PR titled
   "Awin approval: <programme>", subscribed, merged only with Jon's approval
   (blog posts follow the blog workflow). Add a row to the table above.

## Approved but not used

| Programme | Awin id | Approved | Why not used |
| --- | --- | --- | --- |
| brkox | 129093 | 9 Nov 2026 | LED light kits for LEGO sets, sold to US collectors in US dollars. Jon decided on 11 November 2026: US-only, so don't use it. |

## Rejections

| Programme | Awin id | Date | Reason given | What we did |
|---|---|---|---|---|
| Wickes | 1563 | 3 Nov 2026 | "Our systems are blocking content on your site" | Static content for crawlers, About, Contact and Affiliate disclosure pages (PR #46); reapply |
| The Range | 5238 | 3 Nov 2026 | "Dead URL, page not found" | As above; check the website address on the Awin profile; reapply |
| Currys | 1599 | 3 Nov 2026 | Not found in email | Reapply on or after 4 Dec 2026 |
| Cosori UK | 119831 | 4 Nov 2026 | "Site does not complement advertiser brand" | A brand-fit judgement, not a fault on the site; nothing to fix. Air fryer links stay with Tower (20823). Reapply later only with a reason, such as Cosori products on the air fryer page |
| SharkNinja UK | 8059 | 5 Nov 2026 | "Site does not complement advertiser brand" | Brand fit, nothing to fix on the site |
| AO.com | 19526 | 5 Nov 2026 | Not recorded: the email was no longer in the mailbox when checked | Reapply later |
| EcoFlow UK | 51797 | 5 Nov 2026 | "The monthly pageviews are insufficient to meet our needs" | Traffic, not a fault on the site; nothing to fix. The EcoFlow pick on the solar tool keeps its Amazon fallback. Reapply once monthly page views have grown |

## Syncing with the Awin API (optional)

With an API token from Awin (Account > API Credentials), the sync script
checks every programme at once:

    AWIN_TOKEN=... node scripts/awin-sync.mjs

It reads which programmes have approved us, asks Awin's link builder to accept
each landing page, and rewrites `src/awinJoined.js`. Commit that file and the
site switches those picks over. The token must never be committed or put in the
site's code; the links themselves only carry the publisher id.

In the cloud sessions the token is saved as a network secret for api.awin.com
on the "Cost of living" environment (added 9 November 2026), so no variable is
needed there: run the script with `NODE_USE_ENV_PROXY=1 AWIN_TOKEN=proxy-injected` (Node's fetch only goes through the proxy with that flag) and the proxy
puts the real token in. Don't paste the token into chat or a file.

## Offers and discount codes

Offers from joined programmes come from Awin's offers API:

    POST https://api.awin.com/publisher/3143222/promotions
    {"filters":{"membership":"joined","status":"active","type":"all"},"pagination":{"page":1,"pageSize":200}}

Only offers that fit what the site covers go in `src/offers.js` (energy-saving
kit and products we already list; not vacuums, slushie makers and the like).
Each keeps Awin's start and end time. The build leaves out ended offers and an
inline script hides any that end, or haven't started, between deploys, so an
expired offer never shows. They appear on `/offers/` and on the pages named in
each offer's `places`.

Rules: only codes Awin lists for us (never codes found elsewhere), keep within
each programme's terms (Simply LED: codes over 12% need their agreement), and
reword the title plainly without adding claims. The thrice-daily Awin check
refreshes the list and opens a PR when it changes.

First run, 9 November 2026: 25 offers live (Swan, Tower, Simply LED; none from
Meaco). Four picked: Tower AIRFRYER (to 15 Nov), Swan Nordic Duo £50 off (to
30 Nov), Swan SWAN12 (to 31 Dec), Simply LED BULBS10 (to 2030).

## Disclosure

Every pick is labelled as an affiliate link wherever it appears, and the
screen reader text names the retailer ("Lakeland, opens in a new tab").
Clicks show in Umami as `affiliate-click`, with `retailer` alongside
`product` and `place`.
