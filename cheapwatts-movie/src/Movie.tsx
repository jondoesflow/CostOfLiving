import { AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { scenes, TRANSITION_FRAMES } from "./scenes";
import { registry } from "./registry";
import { VO, MUSIC } from "./generated-media";
import { Background } from "./components/Background";
import "./theme";

// Varied transitions, chosen by position (a pure function, not a hook).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Transition = { presentation: TransitionPresentation<any>; timing: TransitionTiming };
const transitionFor = (i: number): Transition => {
  const pick = i % 4;
  if (pick === 0) return { presentation: slide({ direction: "from-bottom" }), timing: springTiming({ durationInFrames: TRANSITION_FRAMES, config: { damping: 200 } }) };
  if (pick === 1) return { presentation: wipe({ direction: "from-left" }), timing: linearTiming({ durationInFrames: TRANSITION_FRAMES }) };
  if (pick === 2) return { presentation: slide({ direction: "from-right" }), timing: springTiming({ durationInFrames: TRANSITION_FRAMES, config: { damping: 200 } }) };
  return { presentation: fade(), timing: linearTiming({ durationInFrames: TRANSITION_FRAMES }) };
};

export const Movie: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const hasVoice = Object.keys(VO).length > 0;
  // Music: punchy for the hook, then a quiet bed under the voice, fading out.
  const musicVolume = (f: number) =>
    interpolate(f, [0, fps * 3, fps * 4, durationInFrames - fps * 1.5, durationInFrames], [0.6, 0.6, hasVoice ? 0.12 : 0.4, hasVoice ? 0.12 : 0.4, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        {scenes.flatMap((scene, i) => {
          const Scene = registry[scene.type];
          const vo = VO[scene.id];
          const items = [
            <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
              <Scene {...scene.props} />
              {vo && <Audio src={staticFile(vo.file)} />}
            </TransitionSeries.Sequence>,
          ];
          if (i < scenes.length - 1) {
            const t = transitionFor(i);
            items.push(<TransitionSeries.Transition key={`${scene.id}-t`} presentation={t.presentation} timing={t.timing} />);
          }
          return items;
        })}
      </TransitionSeries>
      {MUSIC && <Audio src={staticFile(MUSIC)} loop loopVolumeCurveBehavior="extend" volume={musicVolume} />}
    </AbsoluteFill>
  );
};
