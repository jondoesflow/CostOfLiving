---
title: Is a time-of-use tariff worth it if you don't have an electric car?
description: Without an electric car, a time-of-use tariff only pays if your teatime use is small. Real prices, the break-even sum and how to test it on your own data.
date: 2026-11-20
keywords: time of use tariff without electric car, is a time of use tariff worth it, time of use tariff no ev, agile octopus without ev, edf freephase static
tool: switch
products: immersion-timer
draft: false
---

Short answer: **sometimes, but less often than the adverts suggest. Without a car to charge, a time-of-use tariff pays only if you can keep your 4pm to 7pm use low and you have a decent load that can safely run in the cheap hours. For a lot of households, a flat tariff is the better deal.**

A time-of-use tariff charges different prices at different times of day. Cheap overnight, dear at teatime, somewhere in between the rest of the time.

An electric car makes these tariffs easy. It is one big load that doesn't care when it runs. Take the car away and you are left moving washing, dishes and hot water around, which is a much smaller prize. Here is the sum.

## Which time-of-use tariffs can you get without a car?

Fewer than you'd think. I went through the tariffs on sale in the Octopus, EDF and E.ON Next price data on 11 November 2026, and most of the cheap-overnight ones are tied to a piece of kit:

- **Octopus Go and Intelligent Octopus Go**, EDF's **Go Electric** and E.ON's **Next Drive** are all described as electric car tariffs.
- **Cosy Octopus** is described as a heat pump tariff, **Snug Octopus** is for storage heaters, and **Octopus Flux** is for homes with solar panels and a battery.

That leaves a shorter list of tariffs sold without a car in the description:

- **Agile Octopus**: the price changes every half hour, following the wholesale market.
- **EDF FreePhase Dynamic**: unit rates change every day in line with wholesale prices.
- **EDF FreePhase Static**: three fixed price bands, locked in for 24 months.
- **E.ON Next Smart Saver**: fixed for 12 months, with off-peak, super off-peak and peak periods.

All of them need a smart meter that sends half-hourly readings. Eligibility rules change, so check the supplier's own page before you set your heart on one.

## The fixed-window kind: what the numbers look like

FreePhase Static is the simplest to reason about, because the prices don't move. These are its rates for Yorkshire, paying by Direct Debit, on 11 November 2026, next to Flexible Octopus, the standard variable tariff the site uses as its flat comparison.

| | EDF FreePhase Static | Flexible Octopus |
|---|---|---|
| 11pm to 6am | 16.87p per kWh | 25.60p per kWh |
| 4pm to 7pm | 45.68p per kWh | 25.60p per kWh |
| All other hours | 25.25p per kWh | 25.60p per kWh |
| Standing charge | 54.81p a day | 60.89p a day |

Two more things from the same data: the peak applied every day I checked, weekends included, and the tariff carries a £100 exit fee per fuel.

Now the sum that matters. Against the flat rate:

- every kWh you use between 4pm and 7pm costs you **20.08p more**
- every kWh you use between 11pm and 6am saves you **8.73p**
- the rest of the day is close to a draw (0.35p cheaper)
- the lower standing charge is worth about **£22 a year**

So you need roughly 2.3 kWh in the night window to pay for each kWh you use at teatime. That ratio is the whole decision.

## A worked example with ordinary appliances

Using the site's typical figures for each appliance:

| Job | Flat rate | 11pm to 6am | 4pm to 7pm |
|---|---|---|---|
| Dishwasher, eco programme (1.0 kWh) | 26p | 17p | 46p |
| Washing machine, 40°C (0.8 kWh) | 20p | 13p | 37p |
| Tumble dryer, full load (4.0 kWh) | £1.02 | 67p | £1.83 |
| Electric oven, one hour (1.5 kWh) | 38p | 25p | 69p |

Say you run the dishwasher five times a week and the washing machine four times. That is 8.2 kWh a week. Move all of it into the night window and you save about 72p a week, or **£37 a year**.

Now say you cook tea in the electric oven four evenings a week, an hour each time, between 4pm and 7pm. That is 6 kWh a week at the peak price, which costs you an extra £1.20 a week, or **£63 a year**.

The oven alone has wiped out the saving, and I haven't counted the lights, the telly or the kettle yet. The standing charge gets you £22 back, which leaves you about level before any of that.

There is a second catch. Fire services advise against leaving washing machines, tumble dryers and dishwashers running overnight or while you're out. [Devon and Somerset Fire and Rescue](https://www.dsfire.gov.uk/news/safety/why-you-shouldnt-use-washing-machines-and-tumble-dryers-night) explains why. Follow that advice, as I'd suggest you do, and those jobs run in the daytime band instead, where the saving is a third of a penny per kWh.

## What does safely fit the cheap hours?

Loads that are built to run unattended, on their own controls:

- **An immersion heater on a timer.** The site counts an hour of a 3kW immersion as 3 kWh. Seven nights a week, that saves about £1.83 a week against the flat rate, or **£95 a year**. This is the one that changes the answer.
- **Storage heaters**, though they usually belong on a tariff designed for them. I covered that in [Economy 7: how to find your off-peak hours](/blog/economy-7-off-peak-hours-how-to-find-yours/).
- **A home battery**, which can fill overnight and carry you through teatime.

If you have none of those, and you cook on electric in the evening, a fixed-window tariff is hard to make pay.

## The half-hourly kind: cheap weeks and dear weeks

Agile is a different bet. Here are four weeks of half-hourly Agile prices for Yorkshire, straight from the Octopus API, as simple averages of every half hour.

| Week | Average | 4pm to 7pm | Midnight to 6am |
|---|---|---|---|
| 14 to 20 October 2026 | 31.7p | 50.4p | 26.5p |
| 21 to 27 October 2026 | 20.5p | 44.7p | 10.5p |
| 28 October to 3 November 2026 | 39.5p | 59.5p | 34.4p |
| 4 to 10 November 2026 | 42.9p | 68.2p | 32.6p |

In the second week, more than half of all half hours were below the 25.60p flat rate, and the cheapest went to minus 7.34p. In the last two weeks, not one half hour was below the flat rate. The cheapest in the week of 4 November was 25.61p, and the dearest was 91.66p.

So for a fortnight there was no cheap slot to move anything into. No amount of careful timing would have beaten the flat rate in those two weeks.

EDF's FreePhase Dynamic told the same story, averaging 42.6p in the week of 4 to 10 November.

Four weeks in one region is a snapshot, so don't read it as a forecast. Agile has no exit fee, according to the same data, so you can leave after a bad month. But without a car or a battery to soak up the cheap days, you have less to gain from the good weeks and the same exposure to the bad ones. I went through who it suits in [Octopus Agile explained](/blog/octopus-agile-explained-who-it-suits/).

## So who should take one without a car?

It is worth a serious look if:

- you heat your water with an immersion heater on a timer, or you have a battery
- you are home in the day and cook early, late, or on gas
- you are happy to check the prices, or to be tied in for the fixed kind

It is probably not for you if:

- most of your electricity is used between 4pm and 7pm
- you are out all day and everything happens at teatime
- your budget has no room for a dear month

## How to test it on your own usage

1. **Get your half-hourly data.** Your supplier's app or account will show it if you have a smart meter.
2. **Find your teatime share.** Add up what you use between 4pm and 7pm, and what you use overnight. Hold it against the 2.3 to 1 ratio above.
3. **Price it properly.** The [Should I switch?](/should-i-switch/) tool takes your own half-hourly usage and prices it on time-of-use tariffs and a flat one, standing charges included.
4. **Read the exit terms.** A 24-month fix with a £100 exit fee is a bigger commitment than a variable tariff you can walk away from.

Start with step 2. If your 4pm to 7pm number is bigger than your overnight one, stay on a flat tariff and stop worrying about it.
