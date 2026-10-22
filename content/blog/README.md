# Blog posts

Each post is a Markdown file here named `YYYY-MM-DD-slug.md`, built into
`/blog/<slug>/` by `scripts/build-site.mjs` (run as part of `npm run build`).

## Front matter

```
---
title: The headline, written as the question people search for
description: 140 to 160 characters for Google's result snippet
date: 2026-10-22
keywords: main search phrase, related phrase, related phrase
tool: when            # which tool the call to action links to: when, plan, gas, solar, switch
draft: true           # hidden from the live site until approved; remove or set false to publish
---
```

## House rules for posts

- Written in Jon Russell's voice with the `writing-as-jon-russell` skill, and
  passed through its `voice_check.py`. UK English; no em or en dashes. ("meter",
  as in electricity meter, is correct British spelling: ignore that checker flag.)
- Grants, benefits, regulations and consumer rights (ECO4, Great British
  Insulation Scheme, Boiler Upgrade Scheme, Priority Services Register, Cold
  Weather Payment, Winter Fuel Payment, minimum energy efficiency standards,
  switching and billing rules): check the current rules on GOV.UK, Ofgem,
  Citizens Advice or the Energy Saving Trust on the day of writing, link the
  page used, and state amounts and eligibility only as those pages give them.
  Schemes open, close and change, so never rely on memory.
- Savings claims ("turning the thermostat down 1°C saves £X") need a named,
  linked source, or a worked example from the site's own figures with the
  assumptions stated.
- Only verified facts. Prices come from the live supplier APIs (the same ones the
  site uses) and are dated, e.g. "on 22 October 2026". Anything unverified is left
  out, not guessed. Safety advice links to its source.
- One clear search question per post, answered in the first few lines.
- 800 to 1,500 words, `##` headings, a table where it helps, short paragraphs.
- Link to the tool named for the topic in TOPICS.md (by its path, e.g. `/gas-or-electric/`) and,
  where natural, to one earlier post.
- Never repeat a topic or slug that already exists here.

## Approval

The scheduled task opens one pull request per post (`blog/<date>-<slug>`).
Merging the pull request approves it; the next scheduled run (or a Netlify
build, if the site is linked to GitHub) publishes it. Closing it rejects it.
