import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FinaleProps } from "../types";
import { useLayout } from "../layout";
import { theme } from "../theme";
import { BrandMark } from "../components/BrandMark";

export const Finale: React.FC<FinaleProps> = ({ url, strap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { unit, safeX } = useLayout();
  const mark = spring({ frame: frame - 4, fps, config: { damping: 11 } });
  const name = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  const pill = spring({ frame: frame - 26, fps, config: { damping: 12 } });
  const pulse = 1 + 0.03 * Math.sin(Math.max(0, frame - 40) / 5);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: unit * 5, padding: `0 ${safeX}px`, textAlign: "center" }}>
      <div style={{ transform: `scale(${mark}) rotate(${interpolate(mark, [0, 1], [-12, 0])}deg)` }}>
        <BrandMark size={unit * 52} />
      </div>
      <div style={{ fontFamily: theme.heading, fontWeight: 700, fontSize: unit * 14, color: theme.white, whiteSpace: "nowrap", textAlign: "center", opacity: name, transform: `translateY(${interpolate(name, [0, 1], [unit * 4, 0])}px)` }}>
        Cheap Watts
      </div>
      <div style={{ fontFamily: theme.body, fontWeight: 800, fontSize: unit * 8, color: theme.navy, background: theme.lilac, padding: `${unit * 1.6}px ${unit * 5}px`, borderRadius: unit * 10, transform: `scale(${pill * pulse})` }}>
        {url}
      </div>
      <div style={{ fontFamily: theme.body, fontWeight: 600, fontSize: unit * 5.5, color: theme.ink, opacity: pill }}>{strap}</div>
    </AbsoluteFill>
  );
};
