# Tracking links

Use these instead of the bare address, so Umami shows which channel each visit
came from (Umami dashboard: open the site, then the UTM or Referrers section).

The pattern is `?utm_source=<where>&utm_medium=<what kind>&utm_campaign=<why>`.
Keep the words lowercase with hyphens, and reuse them exactly, so the numbers
group together.

| Where you're sharing it | Link |
|---|---|
| Banner on cheappumps.co.uk | https://cheapwatts.co.uk/?utm_source=cheappumps&utm_medium=banner&utm_campaign=sister-site |
| Link in Cheap Pumps footer or menu | https://cheapwatts.co.uk/?utm_source=cheappumps&utm_medium=link&utm_campaign=sister-site |
| jondoesflow.com | https://cheapwatts.co.uk/?utm_source=jondoesflow&utm_medium=website&utm_campaign=projects |
| LinkedIn posts | https://cheapwatts.co.uk/?utm_source=linkedin&utm_medium=social&utm_campaign=launch |
| LinkedIn profile (Featured section) | https://cheapwatts.co.uk/?utm_source=linkedin&utm_medium=profile&utm_campaign=always-on |
| TikTok bio | https://cheapwatts.co.uk/?utm_source=tiktok&utm_medium=bio&utm_campaign=video |
| Instagram bio | https://cheapwatts.co.uk/?utm_source=instagram&utm_medium=bio&utm_campaign=video |
| YouTube Shorts description | https://cheapwatts.co.uk/?utm_source=youtube&utm_medium=video&utm_campaign=video |
| Reddit answers | https://cheapwatts.co.uk/?utm_source=reddit&utm_medium=community&utm_campaign=answers |
| MoneySavingExpert forum | https://cheapwatts.co.uk/?utm_source=mse-forum&utm_medium=community&utm_campaign=answers |
| Mumsnet | https://cheapwatts.co.uk/?utm_source=mumsnet&utm_medium=community&utm_campaign=answers |
| Facebook groups | https://cheapwatts.co.uk/?utm_source=facebook&utm_medium=community&utm_campaign=answers |
| Outreach email to councils and charities | https://cheapwatts.co.uk/?utm_source=outreach&utm_medium=email&utm_campaign=resource-pages |
| Press release | https://cheapwatts.co.uk/?utm_source=press&utm_medium=pr&utm_campaign=price-cap |
| Printed flyer or poster (via QR code) | https://cheapwatts.co.uk/?utm_source=flyer&utm_medium=print&utm_campaign=community |

## Linking straight to a tool or post

Swap the address and keep the same tags, for example:

- https://cheapwatts.co.uk/gas-or-electric/?utm_source=reddit&utm_medium=community&utm_campaign=answers
- https://cheapwatts.co.uk/blog/heated-airer-vs-tumble-dryer-running-cost/?utm_source=facebook&utm_medium=community&utm_campaign=answers

## What else Umami now counts

These buttons are tracked as events (Umami dashboard: Events):

| Event | What it means |
|---|---|
| share-result | Someone pressed "Share this" on a result (with the tool name) |
| add-to-calendar | Downloaded a one-off reminder |
| subscribe-calendar | Subscribed to the daily cheapest-time calendar |
| add-plan-to-calendar | Downloaded an evening plan |
| switch-example / switch-upload | Tried the tariff comparison with the example or their own file |

Links people share from the site carry `utm_source=share`, so you can see how
many visits come from word of mouth.

## Ask people not to strip the tags

Some forums and apps remove anything after `?`. That's fine: those visits just
show up under the referring site instead. Never shorten these links with a
service that adds its own tracking.
