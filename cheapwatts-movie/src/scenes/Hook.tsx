import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { HookProps } from "../types";
import { useLayout } from "../layout";
import { theme } from "../theme";
import { Caption } from "../components/Caption";

// "31p" lands, gets struck through, then "13p" pops in below it.
export const Hook: React.FC<HookProps> = ({ lead, before, after }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { unit, safeX, safeTop } = useLayout();
  const first = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const strike = interpolate(frame, [42, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const second = spring({ frame: frame - 56, fps, config: { damping: 9, stiffness: 160 } });
  const big = { fontFamily: theme.heading, fontWeight: 700, fontSize: unit * 34, lineHeight: 1 } as const;
  return (
    <AbsoluteFill style={{ padding: `${safeTop}px ${safeX}px`, alignItems: "center", justifyContent: "center", gap: unit * 6 }}>
      <Caption text={lead} size={7} />
      <div style={{ position: "relative", ...big, color: theme.red, transform: `scale(${first})`, opacity: interpolate(strike, [0, 1], [1, 0.55]) }}>
        {before}
        <div style={{ position: "absolute", left: "-6%", top: "52%", height: unit * 2.2, width: `${strike * 112}%`, background: theme.red, borderRadius: unit, transform: "rotate(-8deg)" }} />
      </div>
      <div style={{ ...big, color: theme.green, transform: `scale(${second})`, textShadow: `0 0 ${unit * 8}px ${theme.green}66` }}>{after}</div>
    </AbsoluteFill>
  );
};
