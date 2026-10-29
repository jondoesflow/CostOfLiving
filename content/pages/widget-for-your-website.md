---
title: Add Cheap Watts to your website
description: A free box for council, charity and housing association websites that shows residents what their appliances cost to run, and links to the full Cheap Watts tool.
slug: widget-for-your-website
---

If you run a cost of living page, an energy advice page or a tenant help page, you can add this free box to it. Residents pick an appliance and their region and see what it costs to run at today's standard rate, then open the full tool to find the cheapest time on their own tariff.

It's free and needs no account. The box itself has no adverts or affiliate links. Copy the code below and paste it into your page.

## What it looks like

<iframe src="/widget/?r=M" title="Cheap Watts: what does it cost to run?" width="100%" height="460" style="border:0;max-width:480px" loading="lazy"></iframe>

## The code

Paste this into your page where you want the box to appear:

```html
<iframe src="https://cheapwatts.co.uk/widget/" title="Cheap Watts: what does it cost to run?" width="100%" height="460" style="border:0;max-width:480px" loading="lazy"></iframe>
```

Or [download the code as a file](/cheap-watts-widget.html) to pass to whoever looks after your website. It includes these instructions.

Most content management systems have an "embed", "HTML" or "code" block for this. If yours strips out iframes, ask your web team to allow `cheapwatts.co.uk`.

## Show your own region first

Add `?r=` and your region's letter to the address, so residents see your local prices straight away. For example, `https://cheapwatts.co.uk/widget/?r=M` for Yorkshire.

| Letter | Region |
| --- | --- |
| A | Eastern England |
| B | East Midlands |
| C | London |
| D | Merseyside and North Wales |
| E | West Midlands |
| F | North East England |
| G | North West England |
| H | Southern England |
| J | South East England |
| K | South Wales |
| L | South West England |
| M | Yorkshire |
| N | South Scotland |
| P | North Scotland |

You can also choose which appliance it starts on with `&a=`, for example `?r=M&a=dryer` for a tumble dryer, or `&a=heater` for an electric heater.

## The small print

- **Prices:** costs use the standard price-capped variable rate for the region, from Octopus Energy's public price data, including VAT. That's what most households on a default tariff pay. The full tool covers time-of-use and fixed tariffs.
- **Privacy:** the box sets no cookies and collects no personal information. Visits are counted with cookie-less analytics, as described in the [privacy policy](/privacy/).
- **Accessibility:** it works with a keyboard and screen readers, and fits any width from a small phone up.
- **Cost:** it's free. If you'd like a version in your own colours or something it doesn't cover, get in touch at jon@jondoesflow.com.
