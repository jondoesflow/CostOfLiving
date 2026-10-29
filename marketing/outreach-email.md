# Outreach email: councils, charities and housing associations

Send to the people who run "cost of living help" or "energy advice" pages. Short,
personal emails work far better than a mail merge, so change the first line for
each one. Replace everything in [square brackets].

## Who to send it to

- Local councils: the cost of living support page, usually run by a
  communications or welfare team. Look for a "suggest a resource" or contact
  link on that page.
- Citizens Advice local offices, especially energy advisers.
- Housing associations: tenant support or financial inclusion teams.
- Food banks, community pantries and warm space schemes.
- Local and regional energy advice charities.
- Libraries and community centres that keep printed resource lists.

Start with your own area, where "a local developer built this" is a genuine
connection, then widen out. `outreach-contacts.md` lists the largest councils
and the national bodies, with contact routes checked on their own websites.

## Subject line (pick one)

- A free tool for your cost of living page: cheaper electricity, no sign-up
- A free box for your energy advice page: what residents' appliances cost to run
- Free resource for residents: when's the cheapest time to run the washing machine?

## Email

Hi [Name],

I've been reading [Organisation]'s cost of living page, and I think there's a free tool I've built that would sit well alongside the help you already list.

It's called Cheap Watts: https://cheapwatts.co.uk/?utm_source=outreach&utm_medium=email&utm_campaign=resource-pages

It answers the questions people ask about electricity bills in plain English:

- When is the cheapest time to run the washing machine, dishwasher or tumble dryer on my tariff, and what will it cost?
- Is the kettle cheaper than the hob? Is a heated airer cheaper than the tumble dryer?
- Would a different tariff save me money, based on my own smart meter data?

A few things that matter for the people you support:

- It's completely free, with no sign-up, no adverts and no app to install. (A few results link to related products on Amazon, clearly labelled, which helps keep the site free.)
- It works on any phone and is built to the WCAG 2.2 AA accessibility standard, including screen readers.
- It uses live prices from Octopus, EDF and E.ON Next, and people on any other supplier can type in their own rates.
- Nothing personal is collected. If someone uploads their usage file, it's read on their own device and never leaves it.
- It's honest: if someone's on a standard tariff, it tells them the time of day doesn't matter, rather than promising savings that aren't there.

If you think it would help, there are two easy ways to add it:

1. A link on your page. I've put a short description below that you're welcome to use as it is.
2. A free box that sits on your page itself. Residents pick an appliance and see what it costs to run at today's prices in [region name], with a button through to the full tool. It's one line of code, with no cookies and no adverts. Here it is with your region already set:

<iframe src="https://cheapwatts.co.uk/widget/?r=[region letter]" title="Cheap Watts: what does it cost to run?" width="100%" height="460" style="border:0;max-width:480px" loading="lazy"></iframe>

There's a preview and instructions for your web team here: https://cheapwatts.co.uk/widget-for-your-website/?utm_source=outreach&utm_medium=email&utm_campaign=widget

Suggested description:

> Cheap Watts (cheapwatts.co.uk) is a free website that shows what your appliances cost to run, the cheapest time to run them on your tariff, and whether a different tariff would save you money. No sign-up, and it works for customers of any supplier.

I'm happy to answer any questions.

Thanks for the work you do,

Jon Russell
https://www.jondoesflow.com/
[Your email address]

## Follow-up (one week later, if no reply)

Hi [Name],

Just a gentle nudge on this in case it got buried. Cheap Watts is a free tool that helps residents cut their electricity bills: https://cheapwatts.co.uk/?utm_source=outreach&utm_medium=email&utm_campaign=resource-pages

If a link is easier than the box, that's just as welcome.

If it's not a fit for your page, no problem at all, and thanks for reading.

Jon

## Keeping track

Keep a simple list: organisation, contact, date sent, date followed up, and
whether they linked. Links from council and charity sites help the site rank
in Google as well as reaching people directly. Visits from these emails show up
in Umami under `utm_source=outreach`, and visits from embedded boxes under
`utm_source=widget`. To see which sites have embedded the box, open the
`/widget/` page in Umami and look at its referrers.

## Region letters for the box

A Eastern England, B East Midlands, C London, D Merseyside and North Wales,
E West Midlands, F North East England, G North West England, H Southern England,
J South East England, K South Wales, L South West England, M Yorkshire,
N South Scotland, P North Scotland. If you're not sure, look up the council's
own postcode in the Cheap Watts tool ("Or find it by postcode").
