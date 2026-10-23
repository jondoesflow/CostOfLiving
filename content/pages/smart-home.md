---
title: Use Cheap Watts with Home Assistant and other smart home systems
description: Start your washing machine, dishwasher or car charger at the cheapest time automatically, using the Cheap Watts calendar feed or best-time link with Home Assistant.
slug: smart-home
---

Cheap Watts can't switch your appliances on by itself, but your smart home system can. Give it one of two links from Cheap Watts and it can start the machine at the cheapest time on your tariff, every day, without you checking.

Both links are free, need no account, and hold only your tariff, region and appliance figures.

## Before you start

**Your machine needs to accept remote start.** Most smart washing machines, dryers and dishwashers make you switch on remote start on the machine itself each time, for safety. So the routine is: load it, switch on remote start, and let your smart home start it at the cheap time.

**Your machine needs to be in your smart home system.** In Home Assistant, Samsung appliances connect through the SmartThings integration, and Bosch, Siemens and Neff through Home Connect. Other brands have their own.

## Get your link

1. Open [Cheap Watts](/), choose your supplier, tariff and region, then your appliance.
2. Under the result, find **Do this every day?** and choose **Copy link instead** for the calendar feed, or **Smart home link** for the best-time link.

## Option 1: the calendar feed

The calendar feed is a calendar with one event a day, moved to the cheapest time as prices change. Anything that can trigger from a calendar can use it.

In Home Assistant, add the **Remote Calendar** integration (Settings, Devices and services, Add integration) and paste in your calendar link. Then create an automation that starts your machine when the event begins:

```yaml
triggers:
  - trigger: calendar
    event: start
    entity_id: calendar.cheap_watts_washing_machine
actions:
  # Replace this with your machine's start action
  - action: notify.notify
    data:
      message: "Cheapest time to run the washing machine is now"
```

Check the calendar's entity name under Settings, Entities, as it depends on what you call it.

## Option 2: the best-time link

The best-time link returns the cheapest start time as data, which suits automations that need more detail, like the cost or whether tomorrow's prices are out yet. It looks like this:

```
https://cheapwatts.co.uk/api/best-time?t=agile&r=M&k=0.8&m=120
```

Add `&by=07:00` to the end if it must be finished by a set time (UK time, 24-hour clock).

Add `&up=07:00` if you want it ready when you get up rather than hours before, so washing isn't left sitting damp. It finishes by then, but no more than an hour before. Change the hour with `&wait=120` (in minutes). For washing machines, washer-dryers and dishwashers, keep the `&a=` part of your link: it tells Cheap Watts most of the power goes on heating, so it can keep the heating in your cheap hours and let the rest run later.

In Home Assistant, add a REST sensor to `configuration.yaml`, using your own link:

```yaml
rest:
  - resource: "https://cheapwatts.co.uk/api/best-time?t=agile&r=M&k=0.8&m=120"
    scan_interval: 1800
    sensor:
      - name: "Washing machine cheapest start"
        device_class: timestamp
        value_template: "{{ as_datetime(value_json.start) if value_json.start else none }}"
      - name: "Washing machine cheapest cost"
        unit_of_measurement: "p"
        value_template: "{{ value_json.cost_pence }}"
```

Then trigger an automation at that time:

```yaml
triggers:
  - trigger: time
    at: sensor.washing_machine_cheapest_start
actions:
  # Replace this with your machine's start action
  - action: notify.notify
    data:
      message: "Starting the washing machine at the cheapest time"
```

### What the best-time link returns

| Field | What it means |
| --- | --- |
| `start`, `end` | The cheapest time to start and finish, in UTC |
| `finish_by`, `ready_from` | The latest and earliest finish allowed by `by`, `up` and `wait` |
| `start_in_minutes`, `finish_in_minutes` | Minutes from now, handy for a machine's delay timer |
| `cost_pence`, `cost_now_pence`, `saving_pence` | The cost then, the cost if started now, and the difference |
| `any_time_same` | True on a flat tariff, where timing doesn't matter |
| `prices_until` | The last time prices are published for |
| `tomorrow_prices_published` | False on Agile and other dynamic tariffs before the next day's prices are out, usually around 4pm |
| `cheapest_so_far` | True when the best time is in or just after the 4pm to 7pm peak only because later prices aren't out yet. Worth waiting for |
| `message` | Why there's no start time, if there isn't one |

## A few tips

- **On Agile, check after 4pm.** Before then the cheapest overnight hours aren't known. Have your automation skip when `cheapest_so_far` is true, or only arm it in the evening.
- **Car charging.** Most smart chargers and cars can already follow Agile or a cheap window on their own, and that's usually the better choice.
- **Keep it safe.** Fire services advise against leaving washing machines, tumble dryers and dishwashers running overnight or while you're out. If your cheap time is overnight, look for a cheap afternoon or evening slot instead.
