// Energy each option uses, in kWh of electricity or gas. These are typical
// figures worked out from power ratings and rough efficiencies, stated on the
// page so people can judge them. Copied unchanged from the website's
// src/tools/GasOrElectric.jsx; keep the two in step.

export type Fuel = 'elec' | 'gas' | 'none';

export interface ComparisonOption {
  name: string;
  fuel: Fuel;
  kWh: number;
}

export interface Comparison {
  id: string;
  title: string;
  note: string;
  options: ComparisonOption[];
}

export const COMPARISONS: Comparison[] = [
  {
    id: 'water', title: 'Boil a litre of water',
    note: 'A litre needs about 0.09kWh of heat. Kettles and induction hobs put most of that into the water; a gas flame loses more than half around the pan.',
    options: [
      { name: 'Kettle', fuel: 'elec', kWh: 0.11 },
      { name: 'Induction hob', fuel: 'elec', kWh: 0.11 },
      { name: 'Electric hob (ceramic)', fuel: 'elec', kWh: 0.14 },
      { name: 'Gas hob', fuel: 'gas', kWh: 0.22 },
    ],
  },
  {
    id: 'meal', title: 'Cook dinner',
    note: 'Rough figures for one meal: oven for an hour, air fryer for 30 minutes, microwave for 15 minutes, slow cooker for 8 hours on low. Not every dish suits every method.',
    options: [
      { name: 'Electric oven', fuel: 'elec', kWh: 1.5 },
      { name: 'Gas oven', fuel: 'gas', kWh: 2.0 },
      { name: 'Air fryer', fuel: 'elec', kWh: 0.5 },
      { name: 'Microwave', fuel: 'elec', kWh: 0.25 },
      { name: 'Slow cooker', fuel: 'elec', kWh: 1.3 },
    ],
  },
  {
    id: 'heat', title: 'Keep warm for an hour',
    note: 'About 1.5kW of heat for one room. A gas boiler is around 85% efficient but usually heats the whole house, so its real cost is often higher. Heat pumps and air conditioners in heating mode make roughly 3 units of heat per unit of electricity. A heated throw warms you, not the room.',
    options: [
      { name: 'Electric heater', fuel: 'elec', kWh: 1.5 },
      { name: "Gas central heating (one room's worth)", fuel: 'gas', kWh: 1.76 },
      { name: 'Heat pump or air conditioner', fuel: 'elec', kWh: 0.5 },
      { name: 'Heated throw or electric blanket', fuel: 'elec', kWh: 0.1 },
    ],
  },
  {
    id: 'shower', title: 'Have an 8-minute shower',
    note: 'A 9.5kW electric shower for 8 minutes, against a gas combi boiler (about 85% efficient) heating the same water. A shorter shower saves more than either.',
    options: [
      { name: 'Electric shower', fuel: 'elec', kWh: 1.27 },
      { name: 'Gas boiler shower', fuel: 'gas', kWh: 1.49 },
    ],
  },
  {
    id: 'drying', title: 'Dry a load of washing',
    note: 'Typical full loads: tumble dryer 4kWh, heat pump dryer 1.5kWh, heated airer about 300W for 4 hours, dehumidifier about 250W for 8 hours in a closed room.',
    options: [
      { name: 'Tumble dryer', fuel: 'elec', kWh: 4.0 },
      { name: 'Heat pump dryer', fuel: 'elec', kWh: 1.5 },
      { name: 'Heated airer', fuel: 'elec', kWh: 1.2 },
      { name: 'Dehumidifier', fuel: 'elec', kWh: 2.0 },
      { name: 'Washing line or clothes horse', fuel: 'none', kWh: 0 },
    ],
  },
];
