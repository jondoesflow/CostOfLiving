// Each tool's own address and search listing. Shared by the app (for links
// and routing) and scripts/build-site.mjs (which writes a real HTML page for
// each, so Google can index the tools separately).
export const SITE_URL = "https://cheapwatts.co.uk";

export const PAGES = [
  {
    id: "when", path: "/",
    title: "Cheap Watts: cut the cost of your electricity",
    description: "Free tools to cut your electricity bill: the cheapest and greenest time to run appliances, gas or electric, solar and batteries, and whether switching tariff would save you money.",
  },
  {
    id: "plan", path: "/plan-my-evening/",
    title: "Plan my evening: fit your appliances into the cheapest hours · Cheap Watts",
    description: "Running the washing, the dishwasher and the car tonight? Cheap Watts fits them into the cheapest hours on your tariff, one at a time if you need to.",
  },
  {
    id: "gas", path: "/gas-or-electric/",
    title: "Gas or electric? Kettle vs hob, heater vs central heating · Cheap Watts",
    description: "Is the kettle cheaper than the hob? Electric heater or central heating? Compare everyday jobs at today's UK gas and electricity prices.",
  },
  {
    id: "solar", path: "/solar-and-batteries/",
    title: "Solar panels and home batteries: use it or sell it? · Cheap Watts",
    description: "Should you use your solar power or export it? When should your home battery charge and empty? Live import and export prices, worked out for you.",
  },
  {
    id: "switch", path: "/should-i-switch/",
    title: "Should I switch electricity tariff? Compare with your own usage · Cheap Watts",
    description: "Upload your smart meter's half-hourly usage and see what you'd have paid on Agile, Octopus Go, EDF GoElectric, E.ON Next Drive and more, standing charges included.",
  },
];

export const pageFor = (id) => PAGES.find((p) => p.id === id);
