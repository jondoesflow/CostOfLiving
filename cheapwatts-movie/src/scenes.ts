import type { SceneConfig, ShotProps } from "./types";
import { VO } from "./generated-media";

export const FPS = 30;
export const TRANSITION_FRAMES = 12;
const VO_TAIL = 10; // breathing room after each line of voiceover

// A scene is at least `seconds` long, and longer if its voiceover needs it.
const length = (id: string, seconds: number) => {
  const base = Math.round(seconds * FPS);
  const vo = VO[id];
  return vo ? Math.max(base, Math.ceil(vo.seconds * FPS) + VO_TAIL + TRANSITION_FRAMES) : base;
};

const hook = (id: string, seconds: number, props: { before: string; after: string; lead: string }): SceneConfig =>
  ({ id, type: "hook", durationInFrames: length(id, seconds), props });
const shot = (id: string, seconds: number, props: ShotProps): SceneConfig =>
  ({ id, type: "shot", durationInFrames: length(id, seconds), props });
const finale = (id: string, seconds: number, props: { url: string; strap: string }): SceneConfig =>
  ({ id, type: "finale", durationInFrames: length(id, seconds), props });

// THE TIMELINE. Adding a scene is one line. Ids match narration.json, so a
// voiceover file public/vo/<id>.wav is picked up automatically.
export const scenes: SceneConfig[] = [
  hook("hook", 4.2, { lead: "Same wash, same machine", before: "31p", after: "13p" }),
  shot("when", 3.2, { caption: "It's all about when you press start", highlight: "when", image: "shots/result.png", imageWidth: 991, imageHeight: 5018, panFrom: 0, panTo: 0.02 }),
  shot("pick", 5.6, { caption: "Pick an appliance", highlight: "appliance", image: "shots/grid.png", imageWidth: 991, imageHeight: 3741, panFrom: 0, panTo: 0.08 }),
  shot("result", 5.2, { caption: "The cheapest and greenest time", highlight: "greenest", image: "shots/result.png", imageWidth: 991, imageHeight: 5018, panFrom: 0.03, panTo: 0.33 }),
  shot("plan", 5.0, { caption: "Plan the whole evening", highlight: "whole evening", image: "shots/plan.png", imageWidth: 991, imageHeight: 1626, panFrom: 0, panTo: 0.35 }),
  shot("gas", 5.0, { caption: "Gas or electric?", highlight: "Gas", image: "shots/gas-warm.png", imageWidth: 991, imageHeight: 1036, panFrom: 0, panTo: 0 }),
  shot("switch", 5.0, { caption: "Should you switch tariff?", highlight: "switch", image: "shots/switch.png", imageWidth: 991, imageHeight: 2910, panFrom: 0, panTo: 0.3 }),
  finale("finale", 4.6, { url: "cheapwatts.co.uk", strap: "Free · No sign-up · No app" }),
];

// Total length: every scene, minus the overlap of each transition.
export const totalDuration = (list: SceneConfig[] = scenes) =>
  list.reduce((sum, s) => sum + s.durationInFrames, 0) - TRANSITION_FRAMES * Math.max(0, list.length - 1);
