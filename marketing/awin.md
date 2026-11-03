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
| EcoFlow portable power station | EcoFlow UK (applied, pending) | 51797 | https://ui.awin.com/merchant-profile/51797 |
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

## After an approval email

Run the sync with the API token from Awin (Account > API Credentials):

    AWIN_TOKEN=... node scripts/awin-sync.mjs

It reads which programmes have approved us, asks Awin's link builder to accept
each landing page, and rewrites `src/awinJoined.js`. Commit that file and the
site switches those picks over. The token must never be committed or put in the
site's code; the links themselves only carry the publisher id.

## Disclosure

Every pick is labelled as an affiliate link wherever it appears, and the
screen reader text names the retailer ("Lakeland, opens in a new tab").
Clicks show in Umami as `affiliate-click`, with `retailer` alongside
`product` and `place`.
