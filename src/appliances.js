// Typical figures for a UK household. Users can edit both numbers, so these
// only need to be sensible starting points, not exact.
export const APPLIANCES = [
  { id: "washer", labelHint: true, name: "Washing machine", icon: "WashingMachine", kWh: 0.8, mins: 120, perWeek: 4, note: "40°C cotton wash" },
  { id: "dryer", labelHint: true, name: "Tumble dryer", icon: "Wind", kWh: 4.0, mins: 120, perWeek: 3, note: "Condenser or vented, full load" },
  { id: "hpdryer", labelHint: true, name: "Heat pump dryer", icon: "Fan", kWh: 1.5, mins: 150, perWeek: 3, note: "Full load" },
  { id: "dishwasher", labelHint: true, name: "Dishwasher", icon: "Utensils", kWh: 1.0, mins: 150, perWeek: 5, note: "Eco programme" },
  { id: "oven", name: "Electric oven", icon: "Flame", kWh: 1.5, mins: 60, perWeek: 4, note: "One hour at 200°C" },
  { id: "airfryer", name: "Air fryer", icon: "Soup", kWh: 0.5, mins: 30, perWeek: 4, note: "30 minutes" },
  { id: "slowcooker", name: "Slow cooker", icon: "CookingPot", kWh: 1.3, mins: 480, perWeek: 2, note: "8 hours on low" },
  { id: "immersion", name: "Immersion heater", icon: "Droplets", kWh: 3.0, mins: 60, perWeek: 7, note: "3kW element for an hour" },
  { id: "heater", name: "Electric heater", icon: "Heater", kWh: 4.0, mins: 120, perWeek: 5, note: "2kW for two hours" },
  { id: "dehumidifier", name: "Dehumidifier", icon: "AirVent", kWh: 2.0, mins: 480, perWeek: 4, note: "250W for 8 hours" },
  { id: "ebike", name: "E-bike / scooter", icon: "Bike", kWh: 0.5, mins: 240, perWeek: 3, note: "Full charge" },
  { id: "ev", name: "Electric car", icon: "Car", kWh: 30, mins: 270, perWeek: 2, note: "30kWh on a 7kW home charger" },
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
