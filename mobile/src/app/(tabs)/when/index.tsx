import { useEffect, useMemo, useState } from 'react';
import { ApplianceStep, ChargeResultCard, ResultCard } from '../../../components/when';
import { PricesStatus } from '../../../components/PricesStatus';
import { Footnote, Screen } from '../../../components/ui';
import { useElectricity } from '../../../lib/electricity';
import { APPLIANCES } from '../../../lib/shared';
import { installNotificationHandler } from '../../../lib/when/reminders';
import { whenModel } from '../../../lib/when/view';

// The "Cheapest time" tool: a port of the website's src/tools/WhenToRun.jsx.
export default function WhenScreen() {
  const elec = useElectricity();
  const { slots, ready, now, carbon, tariffInfo } = elec;
  const [applianceId, setApplianceId] = useState<string | null>(null);
  const [kWh, setKWh] = useState<number | null>(null);
  const [mins, setMins] = useState<number | null>(null);
  const [finishBy, setFinishBy] = useState<number | null>(null);
  const [upAt, setUpAt] = useState<number | null>(null);
  const [wait, setWait] = useState(60);

  // So a reminder shows as a banner if it fires while the app is open.
  useEffect(() => installNotificationHandler(), []);

  const m = useMemo(
    () => whenModel({ applianceId, kWh, mins, finishBy, upAt, wait, slots, carbon, ready, now, tariffInfo }),
    [applianceId, kWh, mins, finishBy, upAt, wait, slots, carbon, ready, now, tariffInfo],
  );

  function pick(id: string) {
    setApplianceId(id);
    const a = APPLIANCES.find((x) => x.id === id);
    if (a) {
      setKWh(a.kWh);
      setMins(a.mins);
    } else {
      setKWh(1);
      setMins(60);
    }
  }

  const { appliance } = m;
  return (
    <Screen>
      <ApplianceStep
        applianceId={applianceId}
        pick={pick}
        kWh={kWh}
        setKWh={setKWh}
        mins={mins}
        setMins={setMins}
        finishBy={m.activeFinishBy}
        setFinishBy={setFinishBy}
        finishOptions={m.finishOptions}
        upAt={m.activeUpAt}
        setUpAt={setUpAt}
        wait={wait}
        setWait={setWait}
      />

      <PricesStatus waiting={Boolean(applianceId)} />

      {m.plan && appliance ? (
        <ChargeResultCard
          plan={m.plan}
          green={m.green}
          kWh={kWh ?? 0}
          perWeek={appliance.perWeek ?? 0}
          applianceName={appliance.name}
          finishBy={m.activeFinishBy}
          pending={m.pending}
        />
      ) : m.result !== undefined ? (
        <ResultCard
          result={m.result}
          green={m.green}
          kWh={kWh ?? 0}
          perWeek={appliance?.perWeek ?? 0}
          applianceName={appliance?.name ?? 'Appliance'}
          finishBy={m.latest}
          upAt={m.activeUpAt}
          cheapestAny={m.cheapestAny}
          noTimer={Boolean(appliance?.noTimer)}
          pending={m.pending}
          soFar={m.soFar}
        />
      ) : null}

      <Footnote>
        Prices come from your supplier&apos;s public price API and the greenest times from National Grid&apos;s carbon forecast. Nothing about you leaves this phone.
      </Footnote>
    </Screen>
  );
}
