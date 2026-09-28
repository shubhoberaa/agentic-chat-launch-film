import { loadFont as loadSerif } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadSans } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

const serifN = loadSerif("normal", { weights: ["400", "500"], subsets: ["latin"] });
loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const sans = loadSans("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const SERIF = serifN.fontFamily;
export const SANS = sans.fontFamily;
export const MONO = mono.fontFamily;

export const FPS = 60;

// Palette read off the product's own dark theme + logo gradient
export const C = {
  stage: "#000000",
  stage2: "#0a0a0b",
  card: "#0b0b0c",
  ink: "#f2f2f2",
  muted: "#999999",
  dim: "#5c5c5f",
  line: "rgba(255,255,255,0.12)",
  line2: "rgba(255,255,255,0.07)",
  bubble: "#262629",
  blue: "#066BFA",
  blueSoft: "#7CC3FF",
  ok: "#8fd3a6",
};

// Beat grid of "Hazy After Hours": first kick of the drop at 15.88s, 121 BPM
export const DROP = 15.88;
export const BEAT = 0.4959;
export const B = (n: number) => DROP + n * BEAT;
export const f = (sec: number) => Math.round(sec * FPS);
