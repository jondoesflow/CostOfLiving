import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

// Cheap Watts brand: the site's navy, plus the gold money bag and purple bulb
// from the share image.
export const theme = {
  navy: "#1d3461",
  navyDeep: "#14244a",
  purple: "#8b5cf6",
  lilac: "#c4b5fd",
  gold: "#e0a83e",
  goldLight: "#f5c451",
  green: "#6ee7b7",
  red: "#fca5a5",
  white: "#ffffff",
  ink: "#e8edf7",
  // Quoted: a family name ending in a number is ignored unless it is.
  heading: '"Fraunces", serif',
  body: '"Source Sans 3", sans-serif',
};

// Load the fonts before any frame renders (loadFont holds rendering until ready).
export const fontsReady = Promise.all([
  loadFont({ family: "Fraunces", url: staticFile("fonts/fraunces-700.woff2"), weight: "700" }),
  loadFont({ family: "Source Sans 3", url: staticFile("fonts/sourcesans-600.woff2"), weight: "600" }),
  loadFont({ family: "Source Sans 3", url: staticFile("fonts/sourcesans-800.woff2"), weight: "800" }),
]);
