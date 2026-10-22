import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import type { ShotProps } from "../types";
import { useLayout } from "../layout";
import { Caption } from "../components/Caption";

// A real screenshot of the site in a rounded "phone screen", slowly panning,
// with the headline above it.
export const Shot: React.FC<ShotProps> = ({ caption, highlight, image, imageWidth, imageHeight, panFrom = 0, panTo = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { width, height, unit, safeX, safeTop, safeBottom } = useLayout();
  const enter = spring({ frame: frame - 6, fps, config: { damping: 16 } });

  const boxW = width - safeX * 2;
  const top = safeTop + unit * 30;
  const boxH = height - top - safeBottom;
  const shown = (boxW / imageWidth) * imageHeight;
  const maxPan = Math.max(0, shown - boxH);
  const pan = interpolate(frame, [12, durationInFrames - 10], [panFrom, panTo], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
  });
  const offset = Math.min(maxPan, pan * shown);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: safeTop, left: safeX, right: safeX, height: unit * 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Caption text={caption} highlight={highlight} />
      </div>
      <div
        style={{
          position: "absolute", top, left: safeX, width: boxW, height: Math.min(boxH, shown),
          borderRadius: unit * 4, overflow: "hidden", background: "#f8f7f4",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45), 0 0 0 6px rgba(255,255,255,0.08)",
          transform: `translateY(${interpolate(enter, [0, 1], [unit * 20, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
          opacity: enter,
        }}
      >
        <Img src={staticFile(image)} style={{ width: boxW, height: shown, transform: `translateY(${-offset}px)`, display: "block" }} />
      </div>
    </AbsoluteFill>
  );
};
