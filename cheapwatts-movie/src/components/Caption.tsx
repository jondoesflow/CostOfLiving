import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../layout";
import { theme } from "../theme";

// Big headline whose words pop in one by one; words in `highlight` are gold.
export const Caption: React.FC<{ text: string; highlight?: string; size?: number }> = ({ text, highlight, size = 9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { unit } = useLayout();
  const marked = new Set((highlight ?? "").toLowerCase().split(/\s+/).filter(Boolean));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${unit * 0.6}px ${unit * 2}px`, textAlign: "center" }}>
      {text.split(" ").map((word, i) => {
        const pop = spring({ frame: frame - 4 - i * 3, fps, config: { damping: 14, stiffness: 180 } });
        const clean = word.toLowerCase().replace(/[^a-z']/g, "");
        return (
          <span
            key={i}
            style={{
              fontFamily: theme.body, fontWeight: 800, fontSize: unit * size, lineHeight: 1.05,
              color: marked.has(clean) ? theme.goldLight : theme.white,
              opacity: interpolate(pop, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(pop, [0, 1], [unit * 3, 0])}px) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
              textShadow: "0 6px 24px rgba(0,0,0,0.35)",
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
