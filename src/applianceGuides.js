// Copy for the "how much does it cost to run" page of each appliance in
// src/appliances.js. Figures in the copy come from appliances.js at build
// time, so these only hold the words. `alt` points at a cheaper appliance
// for the same job, where there is one.
export const GUIDES = {
  washer: {
    question: "How much does a washing machine cost to run?",
    intro: "A washing machine uses most of its electricity heating the water, so the temperature you pick matters far more than how long the cycle lasts. A 40°C cotton wash on a modern machine uses under a unit; a 60°C wash can use twice that.",
    tips: [
      "Wash at 30°C or 40°C unless something really needs hotter. Most modern detergents are made for it.",
      "Fill the drum. A half load uses nearly as much electricity as a full one.",
      "Skip the pre-wash unless clothes are heavily soiled.",
      "A faster spin costs very little and gets clothes drier, which saves far more if you tumble dry.",
    ],
  },
  washerdryer: {
    question: "How much does a washer-dryer cost to run?",
    intro: "A washer-dryer is two appliances in one, and the drying half is where the money goes. A full wash-and-dry cycle can take five hours and use several units, most of it in the drying stage.",
    tips: [
      "Dry the washing on an airer or outside when you can, and use the dryer part for the last bit only.",
      "Dry smaller loads than you wash. Most washer-dryers dry about half the load they can wash, and overfilling makes the dry stage run far longer.",
      "Use the highest spin speed before drying.",
    ],
    alt: { id: "airer", note: "A heated airer dries a load for a fraction of the cost, just more slowly." },
  },
  dryer: {
    question: "How much does a tumble dryer cost to run?",
    intro: "A vented or condenser tumble dryer is one of the most expensive appliances in the house to run, because it heats air for an hour or two at a time. Three loads a week adds up to a noticeable chunk of an annual bill.",
    tips: [
      "Spin the washing at the highest speed first. Drier washing means a shorter, cheaper dry.",
      "Clean the filter every load. A clogged filter makes every cycle longer.",
      "Use the sensor-dry setting rather than a timer, so it stops when the clothes are dry.",
      "Don't overfill it. Clothes need room to tumble.",
    ],
    alt: { id: "hpdryer", note: "A heat pump dryer uses about a third of the electricity for the same load." },
  },
  hpdryer: {
    question: "How much does a heat pump tumble dryer cost to run?",
    intro: "A heat pump dryer reuses the heat it makes instead of blowing it out of a vent, so it uses far less electricity than a condenser or vented dryer. It runs cooler and takes longer, but it costs a fraction as much per load.",
    tips: [
      "Expect a longer cycle than an old dryer, and don't worry about it: the long cycle is why it's cheap.",
      "Clean both the fluff filter and the heat exchanger filter, which clog faster than people expect.",
      "Spin washing at the highest speed before drying.",
    ],
  },
  airer: {
    question: "How much does a heated airer cost to run?",
    intro: "A heated clothes airer is a low-power heater you hang washing on. At around 300 watts it costs pennies an hour, but it runs for several hours, so a load isn't free. It's still much cheaper than a tumble dryer, and it helps warm the room a little too.",
    tips: [
      "Put a cover over it. A cover traps the warm air and can halve the drying time.",
      "Spin washing well before hanging it, and spread things out so air gets round them.",
      "Run it in a room with the door closed and a window on the latch, or use a dehumidifier, to stop damp building up.",
    ],
  },
  iron: {
    question: "How much does an iron cost to run?",
    intro: "A steam iron draws a lot of power, around 2 to 3 kilowatts, but it only heats for a few minutes in each half hour of ironing. Half an hour of ironing costs about the same as a cup of tea's worth of kettle.",
    tips: [
      "Iron in one go rather than in lots of short sessions, so the iron heats up once.",
      "Start with things that need the lowest temperature and work up.",
      "Take washing out of the dryer or off the line promptly and fold it: half of it won't need ironing.",
    ],
  },
  dishwasher: {
    question: "How much does a dishwasher cost to run?",
    intro: "A dishwasher heats water twice, once to wash and again at the end to help the dishes dry, and that's where almost all the electricity goes. The eco programme runs longer but heats the water less, so it's the cheapest setting despite taking hours.",
    tips: [
      "Use the eco programme. It's slow because it's cheap, not the other way round.",
      "Run it full. A full load costs the same as a half one.",
      "Skip rinsing plates under the hot tap first: scrape them instead.",
      "Open the door at the end instead of using the heated dry, if your machine lets you.",
    ],
  },
  oven: {
    question: "How much does an electric oven cost to run?",
    intro: "An electric oven draws two to three kilowatts while it heats, then cycles on and off to hold the temperature. An hour at 200°C uses around one to two units depending on the oven, the size of the cavity and how often you open the door.",
    tips: [
      "Cook more than one thing at once. The second tray is free.",
      "Don't open the door to check. Every time you do, the oven loses heat and reheats.",
      "Use a fan setting and lower the temperature by about 20°C.",
      "Turn it off a few minutes early. The residual heat finishes the job.",
    ],
    alt: { id: "airfryer", note: "An air fryer cooks small amounts for a fraction of the cost, because it heats a much smaller space." },
  },
  airfryer: {
    question: "How much does an air fryer cost to run?",
    intro: "An air fryer is a small fan oven. It's cheap to run because it heats a tiny space quickly and cooks fast, not because it uses less power while it's on. For one or two portions it beats the oven easily; for a full roast dinner the oven often wins.",
    tips: [
      "Don't preheat unless the recipe insists. Most air fryers reach temperature in a minute or two.",
      "Cook in a single layer and shake halfway, so you don't have to run it twice.",
      "For a big batch, the oven can work out cheaper per portion.",
    ],
  },
  slowcooker: {
    question: "How much does a slow cooker cost to run?",
    intro: "A slow cooker draws only 100 to 200 watts, about the same as an old light bulb, but it runs all day. Eight hours on low adds up to around a unit of electricity, which still makes it one of the cheapest ways to cook a meal.",
    tips: [
      "Keep the lid on. Lifting it lets the heat out and adds cooking time.",
      "Fill it at least half full; it works best that way.",
      "Batch cook and freeze portions, so one run of the slow cooker makes several meals.",
    ],
  },
  breadmaker: {
    question: "How much does a bread maker cost to run?",
    intro: "A bread maker spends most of its three-hour cycle kneading and proving, which uses almost nothing, and only heats for the last hour or so. A loaf costs well under a unit of electricity to bake, usually less than heating the oven for the same job.",
    tips: [
      "Use a delay timer so the loaf finishes when you get up, and run the bake in your cheap hours if you have them.",
      "Bake two loaves back to back if your machine is already warm.",
    ],
  },
  immersion: {
    question: "How much does an immersion heater cost to run?",
    intro: "An immersion heater is a 3 kilowatt element in your hot water cylinder, so it uses 3 units for every hour it's on. How long it runs depends on how much hot water you use and how well the cylinder is insulated. On a time-of-use tariff, heating the tank in the cheap hours makes a real difference.",
    tips: [
      "Put it on a timer so it heats the water you need, when it's cheapest, rather than keeping a tank hot all day.",
      "Check the cylinder has a thick jacket or foam insulation. A poorly insulated tank loses heat all day.",
      "Set the thermostat to 60°C: hot enough to be safe, not so hot it wastes energy.",
      "If you have gas central heating, check whether the boiler heats the cylinder more cheaply.",
    ],
  },
  shower: {
    question: "How much does an electric shower cost to run?",
    intro: "An electric shower heats water as it flows, so it draws a lot of power, typically 8.5 to 10.5 kilowatts, but only while you're in it. An eight-minute shower uses a little over a unit. The length of the shower is the whole story.",
    tips: [
      "A four-minute shower costs half an eight-minute one. A timer in the bathroom helps.",
      "Turn the temperature down a touch; the shower draws less power at lower settings.",
      "If you have a combi boiler on gas, a mixer shower from it is usually cheaper per minute.",
    ],
  },
  heater: {
    question: "How much does an electric heater cost to run?",
    intro: "A plug-in electric heater, whether a fan heater, oil-filled radiator or convector, turns electricity straight into heat, so a 2 kilowatt heater costs 2 units an hour at full power. That makes it one of the dearest ways to heat a room for any length of time, though it's fine for warming one room briefly.",
    tips: [
      "Heat the person, not the room: an electric blanket or heated throw costs a fraction as much.",
      "Use the thermostat so it cycles off once the room is warm, rather than running flat out.",
      "Shut the door of the room you're heating.",
      "For hours at a time, gas central heating usually works out cheaper per unit of heat.",
    ],
    alt: { id: "blanket", note: "An electric blanket keeps you warm for about 5% of the cost of running a heater." },
  },
  blanket: {
    question: "How much does an electric blanket cost to run?",
    intro: "An electric blanket draws around 100 watts on a high setting and much less on low, so an hour to warm the bed costs a penny or two. It's one of the cheapest ways to stay warm, which is why it's the standard advice for anyone struggling with heating bills.",
    tips: [
      "Switch it on half an hour before bed and off when you get in, rather than running it all night.",
      "Use the lowest setting that's comfortable.",
      "Check it for wear every year and replace it if the flex or the heating elements look damaged.",
    ],
  },
  dehumidifier: {
    question: "How much does a dehumidifier cost to run?",
    intro: "A compressor dehumidifier uses around 200 to 300 watts, so an eight-hour run uses about two units. It's often used to dry washing indoors, where it's cheaper than a tumble dryer and much better for damp than drying clothes in a cold room.",
    tips: [
      "Close the door and windows of the room it's in, so it dries the room and not the whole house.",
      "Use the laundry setting, if it has one, and put it near the airer.",
      "Set the humidity target to around 50 to 55%. Lower than that costs more for little benefit.",
    ],
  },
  ebike: {
    question: "How much does it cost to charge an e-bike or e-scooter?",
    intro: "An e-bike battery holds around half a unit of electricity, so a full charge costs well under 20p even on a standard tariff. Charging is one of the cheapest parts of owning one. The charger draws under 200 watts, so timing it for cheap hours saves pennies, but it adds up over a year of daily charging.",
    tips: [
      "Charge indoors at room temperature; cold batteries charge slowly and wear faster.",
      "Don't leave it on charge for days. Unplug once it's full.",
      "Never charge an e-bike or e-scooter in a hallway or escape route, and don't charge it overnight while you're asleep.",
    ],
  },
  mobility: {
    question: "How much does it cost to charge a mobility scooter?",
    intro: "A mobility scooter charger draws only a hundred watts or so, but a full charge takes most of a night. A unit of electricity, about the price of a cup of tea, is enough for a full charge, so it costs very little to run.",
    tips: [
      "Charge it after every day of use, even a short one; the batteries last longer that way.",
      "If you have a cheap overnight rate, a timer plug lets you charge in those hours only.",
      "Keep it charged over winter even when it's not in use, or the batteries can be ruined.",
    ],
  },
  ev: {
    question: "How much does it cost to charge an electric car at home?",
    intro: "Charging at home is where the savings of an electric car come from. A typical top-up of 30 units of electricity on a standard tariff costs a few pounds, and on an EV tariff's cheap overnight rate it can cost under half that. Public rapid chargers can cost several times more.",
    tips: [
      "Look at an EV tariff. Octopus Go, EDF GoElectric and E.ON Next Drive have cheap overnight hours made for charging, and most smart chargers can be set to use them.",
      "On Agile, let the car or charger follow the half-hourly prices, or use the cheapest half hours this site shows.",
      "A 7 kilowatt home charger adds about 3.5 units each half hour; a three-pin plug about 1.",
    ],
  },
};
