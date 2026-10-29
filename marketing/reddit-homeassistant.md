# Reddit post: r/homeassistant

A "I built this, feedback welcome" post for Home Assistant users. Reddit uses
markdown, so the formatting below shows as written.

## Before posting

- Read the subreddit's rules and sidebar on the day. Many tech subreddits limit
  self-promotion, and some only allow it on certain days or with a flair. Pick
  the "Personal Setup" or "Share your projects" style flair if there is one.
- Post from your own account and say plainly that you built it. Reddit is
  quick to spot a disguised advert and slow to forgive one.
- Be around for the first two hours to answer comments. That's when a post
  either gets picked up or sinks.
- Use the tracking link below, so Umami shows what the post brought in.
- If it goes well, the same post (with the opening line changed) suits the
  Home Assistant community forum, under "Share your Projects".

## Title (pick one)

- I built a free API that tells HA the cheapest time to run your washing machine on Agile, Go, Cosy and EDF/E.ON tariffs
- Free calendar feed and REST endpoint for the cheapest time to run appliances on UK smart tariffs (no account, no key)

## Post

I've built a free UK site called Cheap Watts that works out the cheapest time to run an appliance on your electricity tariff. I've added two links that Home Assistant can read. Sharing here in case it's useful, and because I'd like feedback from people who'll actually wire it up.

**What it does**

You tell it your tariff, region and the appliance's figures (kWh per run and how long it runs). It returns the cheapest start time, what that costs, and what it would cost if you started now. It covers Agile, Go and Cosy from Octopus, EDF's FreePhase Dynamic and GoElectric, and E.ON Next Drive, using each supplier's public price data. Economy 7 and other off-peak tariffs work too, with your own hours and rates.

No account, no API key, nothing to install. The link holds only your tariff, region and appliance figures.

**Option 1: a calendar feed.** One event a day at the cheapest time, moved as prices change. Add it with the Remote Calendar integration and trigger on the event start.

**Option 2: a REST endpoint.** Returns JSON, for example:

```
https://cheapwatts.co.uk/api/best-time?t=agile&r=M&k=0.8&m=120&a=washer
```

```json
{
  "start": "2026-10-29T20:30:00.000Z",
  "end": "2026-10-29T22:30:00.000Z",
  "start_in_minutes": 308,
  "cost_pence": 29.61,
  "cost_now_pence": 36.81,
  "saving_pence": 7.2,
  "tomorrow_prices_published": false,
  "cheapest_so_far": false
}
```

(That's a real response from this afternoon, trimmed.) A REST sensor with `device_class: timestamp` on `start` and a time trigger is all it takes.

A few things I've tried to get right:

- `&by=07:00` makes it finish by a set time, and `&up=07:00` has it finish no more than an hour before you get up, so washing isn't left sitting damp.
- For washing machines, washer-dryers and dishwashers (the `a=` part of the link), it knows most of the power goes on heating water and when in the cycle that happens, so it keeps those parts in the cheap slots.
- On Agile, tomorrow's prices usually come out around 4pm. Before then the "cheapest" time can be in the evening peak simply because the overnight prices aren't known yet. `cheapest_so_far` is true in that case, so you can have your automation wait.
- On a flat tariff it says so (`any_time_same`) rather than inventing a saving.

The full guide, with YAML for both options, is here: https://cheapwatts.co.uk/smart-home/?utm_source=reddit&utm_medium=community&utm_campaign=homeassistant

One safety note, because it matters: fire services advise against leaving washing machines, dryers and dishwashers running overnight or while you're out. If your cheapest slot is 3am, the `by` and `up` options can find a cheap slot when you're home instead.

What I'd like to know:

1. Which tariffs or suppliers are missing for you?
2. Would an MQTT or native integration be worth building, or is REST fine?
3. Anything in the JSON you'd want that isn't there?

It's free, with no adverts in the API or the guide.

## Replies you'll probably need

**"Why not just use the Octopus Energy integration?"**
That's great if you're on Octopus and want the raw rates. This does the
"cheapest continuous window for a two-hour run" maths for you, works for EDF and
E.ON tariffs too, and handles finish-by times and appliance heating profiles.

**"Is it open source?"**
[CHECK: only say yes if the GitHub repo is public. It has an MIT licence file.]

**"What about Intelligent Octopus Go?"**
Not supported yet: its extra cheap slots are set per household, so they aren't
in the public price data.
