import { useVideoConfig } from "remotion";

// Sizes scale with the short edge, so the same scene works in any format.
export function useLayout() {
  const { width, height } = useVideoConfig();
  const unit = Math.min(width, height) / 100; // 1 unit = 1% of the short edge
  return {
    width,
    height,
    unit,
    portrait: height > width,
    safeX: unit * 6, // TikTok's buttons sit on the right and bottom
    safeTop: height * 0.07,
    safeBottom: height * 0.14,
  };
}
