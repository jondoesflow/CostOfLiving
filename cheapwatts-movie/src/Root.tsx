import { Composition } from "remotion";
import { Movie } from "./Movie";
import { FPS, totalDuration } from "./scenes";

export const RemotionRoot: React.FC = () => (
  <>
    {/* TikTok, Reels and Shorts. Length comes from the timeline in scenes.ts. */}
    <Composition id="CheapWattsTikTok" component={Movie} durationInFrames={totalDuration()} fps={FPS} width={1080} height={1920} />
  </>
);
