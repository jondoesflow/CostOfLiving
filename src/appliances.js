// Typical figures for a UK household. Users can edit both numbers, so these
// only need to be sensible starting points, not exact.
export const APPLIANCE_GROUPS = [
  { id: "laundry", name: "Laundry" },
  { id: "kitchen", name: "Kitchen" },
  { id: "heat", name: "Heating and hot water" },
  { id: "charging", name: "Charging" },
];

export const APPLIANCES = [
  { id: "washer", group: "laundry", labelHint: true, name: "Washing machine", icon: "WashingMachine", kWh: 0.8, mins: 120, perWeek: 4, note: "40°C cotton wash" },
  { id: "washerdryer", group: "laundry", labelHint: true, name: "Washer-dryer", icon: "WashingMachine", kWh: 3.5, mins: 300, perWeek: 3, note: "Wash and dry, full load" },
  { id: "dryer", group: "laundry", labelHint: true, name: "Tumble dryer", icon: "Wind", kWh: 4.0, mins: 120, perWeek: 3, note: "Condenser or vented, full load" },
  { id: "hpdryer", group: "laundry", labelHint: true, name: "Heat pump dryer", icon: "Fan", kWh: 1.5, mins: 150, perWeek: 3, note: "Full load" },
  { id: "airer", group: "laundry", name: "Heated airer", icon: "Rows3", kWh: 1.2, mins: 240, perWeek: 3, note: "About 300W for 4 hours" },
  { id: "iron", noTimer: true, group: "laundry", name: "Iron", icon: "Shirt", kWh: 0.6, mins: 30, perWeek: 2, note: "Steam iron for 30 minutes" },
  { id: "dishwasher", group: "kitchen", labelHint: true, name: "Dishwasher", icon: "Utensils", kWh: 1.0, mins: 150, perWeek: 5, note: "Eco programme" },
  { id: "oven", group: "kitchen", name: "Electric oven", icon: "Flame", kWh: 1.5, mins: 60, perWeek: 4, note: "One hour at 200°C" },
  { id: "airfryer", group: "kitchen", name: "Air fryer", icon: "Soup", kWh: 0.5, mins: 30, perWeek: 4, note: "30 minutes" },
  { id: "slowcooker", group: "kitchen", name: "Slow cooker", icon: "CookingPot", kWh: 1.3, mins: 480, perWeek: 2, note: "8 hours on low" },
  { id: "breadmaker", group: "kitchen", name: "Bread maker", icon: "Croissant", kWh: 0.4, mins: 180, perWeek: 2, note: "One loaf on a basic programme" },
  { id: "immersion", group: "heat", name: "Immersion heater", icon: "Droplets", kWh: 3.0, mins: 60, perWeek: 7, note: "3kW element for an hour" },
  { id: "shower", noTimer: true, group: "heat", name: "Electric shower", icon: "ShowerHead", kWh: 1.27, mins: 8, perWeek: 7, note: "9.5kW shower for 8 minutes" },
  { id: "heater", group: "heat", name: "Electric heater", icon: "Heater", kWh: 4.0, mins: 120, perWeek: 5, note: "2kW for two hours" },
  { id: "blanket", group: "heat", name: "Electric blanket", icon: "BedDouble", kWh: 0.1, mins: 60, perWeek: 7, note: "About 100W for an hour to warm the bed" },
  { id: "dehumidifier", group: "heat", name: "Dehumidifier", icon: "AirVent", kWh: 2.0, mins: 480, perWeek: 4, note: "250W for 8 hours" },
  { id: "ebike", group: "charging", name: "E-bike / scooter", icon: "Bike", kWh: 0.5, mins: 240, perWeek: 3, note: "Full charge" },
  { id: "mobility", group: "charging", name: "Mobility scooter", icon: "Accessibility", kWh: 1.0, mins: 480, perWeek: 3, note: "Full overnight charge" },
  { id: "ev", group: "charging", name: "Electric car", icon: "Car", kWh: 30, mins: 270, perWeek: 2, note: "30kWh on a 7kW home charger" },
];

export const REGIONS = [
  { code: "A", name: "Eastern England" },
  { code: "B", name: "East Midlands" },
  { code: "C", name: "London" },
  { code: "D", name: "Merseyside & North Wales" },
  { code: "E", name: "West Midlands" },
  { code: "F", name: "North East England" },
  { code: "G", name: "North West England" },
  { code: "H", name: "Southern England" },
  { code: "J", name: "South East England" },
  { code: "K", name: "South Wales" },
  { code: "L", name: "South West England" },
  { code: "M", name: "Yorkshire" },
  { code: "N", name: "South Scotland" },
  { code: "P", name: "North Scotland" },
];
