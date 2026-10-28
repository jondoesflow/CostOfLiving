---
title: Solar panels in the UK: how much do they generate, and should you use or sell the power?
description: A 4kW solar system in Leeds makes about 3,800 kWh a year, but 3.5 times more in June than December. Here is what that power is worth used or sold.
date: 2026-10-28
keywords: how much electricity do solar panels generate uk, solar panels use or sell electricity, smart export guarantee worth it, solar panel output winter uk, is solar worth it uk
tool: solar
---

Short answer first: **a typical 4kW home solar system in Yorkshire makes roughly 3,800 kWh a year, and every unit you use yourself is worth about six times more than a unit you sell on a low fixed export rate.**

That second part is the bit most quotes skip. How much you save depends less on the panels and more on how much of the power you use at home while the sun is out.

I've worked it through with real numbers, so you can swap in your own.

## How much do solar panels generate in the UK?

I used PVGIS, the free solar calculator from the European Commission's Joint Research Centre. It uses long-run weather data, so it is a fair guide to an average year, not a forecast for next year.

I asked it for one kilowatt of panels, facing south, tilted at 35 degrees, with its default allowance for system losses (14%). Then I multiplied up to a 4kW system, which is a common size for a house roof. Panels on the east or west, or in shade, will make less.

| Place | Year (kWh) | December (kWh) | June (kWh) |
|---|---|---|---|
| London | 4,090 | 144 | 493 |
| Leeds | 3,807 | 129 | 452 |
| Edinburgh | 3,614 | 89 | 444 |

The spread between places is smaller than people expect. London makes about 13% more than Edinburgh over a year.

The spread between seasons is not small. In Leeds, a 4kW system makes about 452 kWh in June and about 129 kWh in December. That is three and a half times more in June, and it is why solar does very little in the months when your heating is on.

Source: [PVGIS](https://re.jrc.ec.europa.eu/pvg_tools/en/), figures pulled on 28 October 2026.

## Use it or sell it: what is a unit worth?

Every unit your panels make does one of two things. You use it in the house, so you don't buy one from your supplier. Or it goes out to the grid and you get paid for it.

Here are the prices on Octopus's public API on 28 October 2026, in Yorkshire:

| What happens to a unit | Price per kWh |
|---|---|
| You use it, instead of buying it (Flexible Octopus) | 25.60p |
| You sell it on Outgoing Octopus (flat rate) | 12.0p |
| You sell it on Octopus Outgoing Smart Export Guarantee (fixed for 12 months) | 4.1p |

The exports are paid under the Smart Export Guarantee, or SEG. As [Ofgem explains](https://www.ofgem.gov.uk/environmental-and-social-schemes/smart-export-guarantee-seg), suppliers set their own rates and terms, the rate must always be above zero, and you are paid on export meter readings. So it pays to shop around. Octopus's own page for the fixed tariff says it carries a £100 exit fee, which is the sort of thing to read before you sign.

## What it adds up to

Take that 3,807 kWh a year from a 4kW system in Leeds. The split between "used at home" and "exported" depends on your life. Someone out at work all day uses less of the midday sun than someone at home, or with a battery.

| Share you use yourself | Used (kWh) | Exported (kWh) | Value, 12.0p export | Value, 4.1p export |
|---|---|---|---|---|
| 30% | 1,142 | 2,665 | £612 | £402 |
| 50% | 1,903 | 1,903 | £716 | £565 |
| 70% | 2,665 | 1,142 | £819 | £729 |

These sums use 25.60p for the units you use and the export rates above. They assume prices stay the same all year, and they won't.

Two things stand out.

**Using more of your own power is worth more than a better export rate.** Going from 30% to 70% self-use adds about £200 a year at 12.0p, and about £330 at 4.1p.

**A poor export rate hurts most when you export most.** At 4.1p, the 30% household earns £210 less than at 12.0p. The 70% household loses only £90.

I haven't included what the system costs, because I can't give you a verified price. Get several quotes, and divide the price by the yearly figure that matches your household to see how long it takes to pay back.

## How to use more of it yourself

Solar power arrives in the middle of the day, and most homes use it in the morning and evening. Moving the big jobs closer to the sun is the cheapest way to raise your self-use.

- **Run the washing machine, dishwasher and tumble dryer at midday, but only while someone is home and awake.** Don't set them on a timer to run while the house is empty. The site counts a tumble dryer load as 4.0 kWh. At 25.60p that is about £1.02 if you'd have bought it, and about 16p if you sold it at 4.1p. Same load, very different value.
- **Heat water when the sun is out.** An immersion heater uses about 3.0 kWh an hour on the site's figures, which a decent day of solar can cover.
- **Work from home if you can.** More daytime use means more self-use.
- **Think about a battery.** It stores the afternoon surplus for the evening. Whether it pays depends on its cost and your rates, and I'll look at that in a later post.

Most of the saving comes from habits, not kit. If you can only do one thing, run the washing machine around midday. Only do it when someone is home and awake, because washing machines and dryers shouldn't be left running while you're out or asleep.

## What to do next

1. **Check your roof.** Direction, tilt and shade change the output a lot. PVGIS lets you try your own address.
2. **Look at your own daytime use.** Your smart meter's half-hourly data shows how much you use between 10am and 4pm. The cheapest hours matter too if you top up from the grid: see [What's the cheapest time to use electricity in the UK?](/blog/cheapest-time-to-use-electricity-uk/).
3. **Compare export rates before you sign.** Use the [solar and batteries tool](/solar-and-batteries/) to see, right now, whether your next unit is worth more used or sold.
4. **Get more than one quote.** And ask each installer for the yearly generation figure they are assuming, so you can compare it with the numbers above.

Start with step 2. If you are mostly out between 10am and 4pm, the 30% row is the honest one.
