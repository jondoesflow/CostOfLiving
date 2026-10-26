import { useMemo, useState } from 'react';
import { PlanForm } from '../../../components/plan/PlanForm';
import { PlanResult } from '../../../components/plan/PlanResult';
import { PricesStatus } from '../../../components/PricesStatus';
import { Screen } from '../../../components/ui';
import { useElectricity } from '../../../lib/electricity';
import {
  DEFAULT_LIMIT,
  activeFinishBy,
  buildJobs,
  defaultFigures,
  finishOptions,
  makePlan,
  maxAtOnceFor,
  type Figures,
  type LimitValue,
} from '../../../lib/plan/view';

// "Plan my evening": fit several appliances into the cheapest hours. A port of the website's
// src/tools/PlanEvening.jsx; the derivations live in lib/plan/view.ts.
export default function PlanScreen() {
  const { slots, ready, now } = useElectricity();
  const [chosen, setChosen] = useState<string[]>([]);
  const [figures, setFigures] = useState<Record<string, Figures | undefined>>({});
  const [limit, setLimit] = useState<LimitValue>(DEFAULT_LIMIT);
  const [finishBy, setFinishBy] = useState<number | null>(null);

  function toggle(id: string) {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    setFigures((f) => (f[id] ? f : { ...f, [id]: defaultFigures(id) }));
  }
  const setFigure = (id: string, key: keyof Figures, value: number | null) =>
    setFigures((f) => ({ ...f, [id]: { ...(f[id] ?? defaultFigures(id)), [key]: value } }));

  const jobs = useMemo(() => buildJobs(chosen, figures), [chosen, figures]);
  const options = useMemo(() => finishOptions(slots, jobs, now), [slots, jobs, now]);
  const finish = activeFinishBy(finishBy, options);
  const plan = useMemo(() => (ready ? makePlan(slots, jobs, maxAtOnceFor(limit), finish) : null), [ready, slots, jobs, limit, finish]);

  return (
    <Screen>
      <PlanForm
        chosen={chosen}
        onToggle={toggle}
        figures={figures}
        onFigure={setFigure}
        limit={limit}
        onLimit={setLimit}
        finishOptions={options}
        finishBy={finish}
        onFinishBy={setFinishBy}
      />
      <PricesStatus waiting={chosen.length > 0} />
      {plan ? <PlanResult plan={plan} slots={slots} now={now} /> : null}
    </Screen>
  );
}
