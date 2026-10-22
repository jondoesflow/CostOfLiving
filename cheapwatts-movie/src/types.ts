export type HookProps = { before: string; after: string; lead: string };
export type ShotProps = {
  caption: string;
  highlight?: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  // Fractions of the image's height to show at the start and end of the pan.
  panFrom?: number;
  panTo?: number;
};
export type FinaleProps = { url: string; strap: string };

type Base<T extends string, P> = { id: string; type: T; durationInFrames: number; props: P };
export type SceneConfig = Base<"hook", HookProps> | Base<"shot", ShotProps> | Base<"finale", FinaleProps>;
