---
title: How do I read my smart meter and download my half-hourly usage?
description: Your smart meter records your electricity use every half hour. Here is how to read the numbers, where to find them, and what to do with the file.
date: 2026-10-28
keywords: how to download smart meter data, half-hourly electricity usage, how to read smart meter, smart meter data download UK, smart meter csv
tool: switch
---

Short answer first: **your smart meter already records your electricity use every half hour. To see it, check your supplier's app or website for a "usage" or "download data" option, or read the in-home display for what you are using right now.**

That half-hourly record is the most useful thing a smart meter gives you. It shows when you use power, not just how much, and that is exactly what you need to judge whether a time-of-use tariff would suit you.

This post covers what the numbers mean, where to get them, and what to do with them once you have them.

## What your smart meter records

GOV.UK says smart gas and electricity meters [record half-hourly price and consumption data and send automatic meter readings to your energy supplier](https://www.gov.uk/guidance/smart-meters-how-they-work). So there are two layers:

- **The readings your supplier uses for billing.** These are why estimated bills should be a thing of the past.
- **The detailed half-hourly record.** 48 numbers a day, one for each half hour.

GOV.UK also says you control who can access your detailed consumption data and for what purposes, except where it is needed for regulated purposes such as billing. In practice, that means the half-hourly detail you can see in your account may depend on the data choices you have made with your supplier. If your account only shows daily or monthly totals, look in your account's privacy or data settings, or ask your supplier.

## The quick look: your in-home display

If you were given an in-home display, it is the fastest way to see what you are using. GOV.UK says it shows your energy cost and usage, updating [every 30 minutes for gas and in near real-time for electricity](https://www.gov.uk/guidance/smart-meters-how-they-work).

It is good for spotting what is using power right now. Switch the kettle on and watch the number jump. It is not much use for a week or a month of history, which is where the file comes in.

## How to read a half-hourly number

Each reading is in kilowatt hours (kWh), and it covers one half hour.

The only trick is converting it back to a rate of use. A reading of 0.5 kWh in a half hour means you averaged 1 kW over that time. Double the number and you have your average power in kilowatts.

Here is what an ordinary appliance looks like in the data. The site counts a tumble dryer load as 4.0 kWh over about 2 hours. Spread over four half hours, that is roughly 1.0 kWh in each slot. In your file you would see four readings in a row that stand out from everything around them.

And here is the one most people miss. Look at the quietest readings overnight, when everyone is asleep and nothing is on. Say they sit at about 0.1 kWh per half hour. That is an average of 0.2 kW, or 200 watts, running all night, every night. Over a year that comes to:

- 0.1 kWh x 48 half hours x 365 days = 1,752 kWh
- At 25.60p per kWh, the Flexible Octopus rate in Yorkshire on 28 October 2026, that is about **£449**

That is an illustration with made-up numbers, not a measurement of your house. But it shows why the overnight floor is worth finding. I wrote about the same idea in [Which gadgets cost the most on standby?](/blog/standby-power-cost-uk-switch-off-at-the-wall/).

## Where to get the file

Different suppliers do this differently, so I can't give one set of steps that works for everyone. The reliable approach:

1. **Open your supplier's app or website** and find the usage section.
2. **Look for "download", "export" or "download usage".** Some show graphs only, some offer a CSV file you can save.
3. **Choose electricity, half-hourly, and a date range.** A few weeks is plenty to start with.
4. **If there is no download option**, ask your supplier whether one is available, or check whether your smart meter app offers one.

If you are an Octopus customer and you like tinkering, there is another route. Octopus's developer documentation says its API [provides half-hourly consumption data for any electricity MPAN and meter](https://docs.oegb-kraken.energy/rest/guides/endpoints), and you authenticate with your API key. That is more effort than clicking a download button, and it is aimed at people who are comfortable with a bit of code, so I would only go there if the app route fails.

## What to do with the file

You do not need a spreadsheet degree. Three useful questions:

- **When is my floor?** Find your lowest overnight readings, like the example above.
- **How much falls in the expensive hours?** Add up what you use from 4pm to 7pm. On a tariff like Agile, that share matters more than the total. I explained why in [Octopus Agile explained](/blog/octopus-agile-explained-who-it-suits/).
- **What would this have cost on another tariff?** This is the big one, and you can skip the sums.

The [Should I switch?](/should-i-switch/) tool takes a half-hourly CSV file, prices it against several tariffs including Agile, Octopus Go, EDF GoElectric and E.ON Next Drive with standing charges included, and shows the yearly difference. The site says the file is read in your browser and never uploaded anywhere. Formats vary between suppliers, so the tool looks for a date and time column and a kWh column by name.

## A few cautions

- **A few weeks is a snapshot.** Your use in October is not your use in January. Treat any result as an estimate, and run it again when the seasons change.
- **Check the units.** You want kWh, not pounds or pence. If a column is cost, ignore it.
- **Older or non-smart meters won't have this data.** If your account shows nothing, your meter may not be sending half-hourly data, or you may not have a working smart meter.

## What I would do first

Download two or three weeks of half-hourly data, find your overnight floor, then drop the file into the [Should I switch?](/should-i-switch/) tool. Ten minutes, and you will know more about your own electricity than most people ever find out.
