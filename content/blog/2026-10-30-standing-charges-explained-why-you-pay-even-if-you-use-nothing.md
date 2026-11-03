---
title: Standing charges explained: why do you pay even if you use nothing?
description: A standing charge is a daily fee for being connected to gas or electricity. What it covers, what it costs by region, and what the planned changes mean for you.
date: 2026-10-30
keywords: standing charges explained, why do I pay a standing charge, what is a standing charge, gas standing charge abolished, electricity standing charge uk
tool: switch
draft: false
---

Short answer first: **a standing charge is a fixed daily fee for having a gas or electricity supply connected to your home. You pay it every day, even on days you use nothing, because it covers the cost of keeping you connected rather than the energy you burn.**

Ofgem's wording is that it is the charge [you pay every day even if you do not use any energy on that day](https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-and-standing-charges-explained). The Budget 2026 has now said gas standing charges are to be abolished, and electricity ones reformed. Both are plans, not changes you can feel yet.

Everything here is from Ofgem, GOV.UK and the Octopus Energy public API, read on 30 October 2026. Rates move, so check the date on anything you use.

## What the standing charge is for

Ofgem lists what the price cap is built from, and the standing charge sits inside that. The relevant costs include network costs (building and improving the pipes and wires), operating costs such as metering and customer service, and a levelisation allowance that makes sure prepayment and Direct Debit customers pay the same standing charge.

Ofgem doesn't give a pounds-and-pence split of those on the pages I read, so I won't guess how much of your standing charge is network and how much is supplier. What I can say is that you pay it whether or not the heating is on, and that is why it feels unfair to people who use very little.

I went through the rest of the bill in [what's in your electricity bill](/blog/whats-in-your-electricity-bill-vat-levies-policy-costs/). This post is only about the daily fee.

## What it costs right now

[Ofgem's price cap](https://www.ofgem.gov.uk/news/changes-energy-price-cap-between-1-october-and-31-december-2026) for 1 October to 31 December 2026, for a default tariff paid by Direct Debit, averaged across England, Scotland and Wales:

| | Standing charge | Over a year (365 days) |
| --- | --- | --- |
| Electricity | 54.83p a day | £200.13 |
| Gas | 29.68p a day | £108.33 |

The gas figure matches the Budget 2026 document, which says gas standing charges are currently [£108 a year on average](https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html) for the typical billpayer. The yearly sums are mine: pence a day times 365.

## It depends where you live

Ofgem says the level of standing charge varies by where you live, how you pay, the fuel and the type of meter. Here is how much it varies by region. These are the electricity standing charges on Flexible Octopus (a variable tariff, so a real tariff, not the cap average), taken from [Octopus's public API](https://api.octopus.energy/v1/products/VAR-22-11-01/) on 30 October 2026:

| Region | Standing charge | Over a year |
| --- | --- | --- |
| London | 41.39p a day | £151.06 |
| North West England | 44.21p a day | £161.37 |
| Eastern England | 50.55p a day | £184.49 |
| North East England | 60.80p a day | £221.92 |
| Merseyside and North Wales | 67.27p a day | £245.54 |

That is a gap of about £94 a year between the lowest and highest regions, before you have switched anything on. It is one reason why a friend in another part of the country will quote a different "standard" bill to you. Octopus's other regions fall between these figures. Your own rate will be on your bill or in your supplier account.

## Is a low standing charge always better?

Not automatically. Some tariffs trade a lower standing charge for a higher unit rate, and some do the reverse. Which wins depends on how much you use.

The method is simple enough to do on the back of an envelope:

1. Take your yearly kWh from your bill or smart meter.
2. Multiply by the unit rate.
3. Add the standing charge times 365.
4. Do that for each tariff you are comparing.

Someone who uses very little energy is more exposed to the standing charge, because it makes up more of the bill. Someone who uses a lot hardly notices it. If your usage is unusual, the [should I switch tool](/should-i-switch/) will compare tariffs using your own half-hourly data, standing charges included, and my guide to [reading your smart meter and downloading your usage](/blog/read-smart-meter-download-half-hourly-usage/) shows how to get it.

## What the Budget says will change

The [Budget 2026 document](https://www.gov.uk/government/publications/budget-2026-document/budget-2026-html) says:

- **Gas:** the government has asked Ofgem to abolish gas standing charges on domestic bills in Great Britain, aiming for delivery by the end of 2027 or as soon as possible after then. Ofgem will ensure suppliers recover these costs through gas unit rates instead.
- **Electricity:** the government is committing to reform electricity standing charges and will set out details next year.
- **Fairness:** the document accepts that "a number of households may be less able to make the most of the reform", and says it will be implemented fairly, including through targeted mitigation.

Notice what that is. The costs don't vanish. They move into the price per unit. Nothing has changed on your bill yet, and the electricity side has no detail at all.

### Who might win and who might lose

This is my illustration, not a forecast, and the numbers are assumptions. Say the average household uses 10,000 kWh of gas a year and the standing charge is £108. Spread across units, that adds about 1.08p per kWh to the unit rate.

| Household | Gas used | Pays now (standing charge) | Pays after, same money moved to units | Difference |
| --- | --- | --- | --- | --- |
| Low user | 5,000 kWh | £108 | £54 | £54 better off |
| Average | 10,000 kWh | £108 | £108 | No change |
| High user | 15,000 kWh | £108 | £162 | £54 worse off |

That is the shape of the trade. Households that use less gas gain, and households that use more lose, with the total collected staying the same. The government's own wording about "targeted mitigation" suggests it knows some households would be worse off, but the document doesn't say who or how, so I won't guess.

## What you can do now

- **Check your standing charge.** Find the pence per day on your latest bill, for gas and electricity separately.
- **Compare whole tariffs, not just unit rates.** A cheap unit rate with a high standing charge can lose for a low user.
- **Don't expect to dodge it.** Turning everything off doesn't stop it. Switching to a different tariff is the only way to change it.
- **Watch the next price cap.** Ofgem has said it will announce the 1 January to 31 March 2027 level by 25 November 2026.

If you want to see what your own usage would cost on different tariffs, start with the [Cheap Watts](/) calculator for your appliances and the [should I switch tool](/should-i-switch/) for the full bill.
