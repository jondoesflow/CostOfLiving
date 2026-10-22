import type { ComponentType } from "react";
import type { SceneConfig } from "./types";
import { Hook } from "./scenes/Hook";
import { Shot } from "./scenes/Shot";
import { Finale } from "./scenes/Finale";

// Scene type -> component. A new type is a component, one line here, and one
// entry in the SceneConfig union in types.ts.
export const registry: Record<SceneConfig["type"], ComponentType<any>> = {
  hook: Hook,
  shot: Shot,
  finale: Finale,
};
