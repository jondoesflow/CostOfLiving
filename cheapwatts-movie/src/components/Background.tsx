import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Navy backdrop with a slow-drifting purple glow, the brand's signature.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(Math.sin(frame / 90), [-1, 1], [55, 80]);
  const y = interpolate(Math.cos(frame / 110), [-1, 1], [10, 30]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, ${theme.purple}55 0%, ${theme.purple}00 45%), linear-gradient(170deg, ${theme.navy} 0%, ${theme.navyDeep} 100%)`,
      }}
    />
  );
};
