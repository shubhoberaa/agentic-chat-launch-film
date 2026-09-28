import React from "react";
import { AbsoluteFill, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { B, BEAT, C, FPS, f } from "./theme";
import { EXPO, QUAD, lerp, prog } from "./lib";
import { S1Cold, S2Thesis, S3Prompt, S4Orchestrate, S5AllAtOnce, S6Research, S7Docs, S8Connect, S9Key, S10End, S11Sting } from "./scenes";

// Scene boundaries, all on the music's beat grid (seconds)
export const CUTS = {
  s1: 0,
  s2: B(-24),
  s3: B(-16),
  s4: B(0),
  s5: B(16),
  s6: B(22),
  s7: B(36),
  s8: B(46),
  s9: B(56),
  s10: B(64),
  s11: B(80),
  end: B(80) + 3.0,
};
export const TOTAL = f(CUTS.end);

const SEND_AT = B(-2) - CUTS.s3; // local seconds inside S3
const TYPE_START = 1.45;

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const breathe = 0.16 + 0.04 * Math.sin(sec * 0.9);
  const inEnd = sec > CUTS.s11;
  return (
    <AbsoluteFill style={{ background: C.stage }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 0%, rgba(140,158,191,${inEnd ? 0 : breathe}), transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.02) 60%, transparent)" }} />
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 8;
  const x = random(`gx${seed}`) * 200;
  const y = random(`gy${seed}`) * 200;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.07, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="n">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
        </filter>
        <rect x={-x} y={-y} width="2400" height="1400" filter="url(#n)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)" }} />
);

/** Bloom flash at the drop and the end card */
const Flash: React.FC<{ at: number; strength?: number; color?: string }> = ({ at, strength = 0.9, color = "124,195,255" }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS - at;
  if (t < -0.05 || t > 0.9) return null;
  const up = interpolate(t, [-0.05, 0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const down = 1 - prog(frame, at, 0.8, QUAD);
  const o = Math.min(up, down) * strength;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o, background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.95), rgba(${color},0.55) 35%, transparent 75%)` }} />
  );
};

/** Slow camera push that runs under every scene, reset at each cut */
const Camera: React.FC<{ from: number; to: number; amt?: number; children: React.ReactNode }> = ({ from, to, amt = 0.035, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, (to - from) * FPS], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ transform: `scale(${1 + amt * p})` }}>{children}</AbsoluteFill>;
};

const Scene: React.FC<{ from: number; to: number; amt?: number; children: React.ReactNode }> = ({ from, to, amt, children }) => (
  <Sequence from={f(from)} durationInFrames={f(to) - f(from)} premountFor={30}>
    <Camera from={from} to={to} amt={amt}>
      {children}
    </Camera>
  </Sequence>
);

/* ───────────── sound design ───────────── */
type Cue = { at: number; src: string; vol?: number; trim?: number; len?: number; peak?: number };
const sfx = (n: string) => staticFile(`sfx/${n}.mp3`);
const CUES: Cue[] = [
  // cold open
  { at: 0.9, src: "1397", vol: 0.55, len: 0.9 },
  // thesis lines
  { at: CUTS.s2, src: "1492", vol: 0.35, peak: 1.1 },
  { at: CUTS.s2 + BEAT * 3, src: "3120", vol: 0.45 },
  { at: CUTS.s2 + BEAT * 6, src: "3120", vol: 0.45 },
  // composer
  { at: CUTS.s3, src: "1490", vol: 0.4, peak: 0.71 },
  { at: CUTS.s3 + 1.25, src: "2568", vol: 0.7 },
  { at: CUTS.s3 + TYPE_START, src: "2537", vol: 0.35, trim: 0.2, len: SEND_AT - TYPE_START - 0.4 },
  { at: B(-2), src: "3124", vol: 0.9 },
  // the drop: build + impact aligned on its peak
  { at: B(0), src: "2900", vol: 0.75, peak: 4.37 },
  { at: B(0), src: "1486", vol: 0.35, peak: 0.64 },
  // orchestration ticks
  { at: CUTS.s4 + BEAT * 4, src: "914", vol: 0.35, peak: 0.49 },
  { at: CUTS.s4 + BEAT * 4.5, src: "3114", vol: 0.5, peak: 0.34 },
  { at: CUTS.s4 + BEAT * 7.5, src: "1120", vol: 0.9 },
  { at: CUTS.s4 + BEAT * 8.2, src: "1120", vol: 0.9 },
  { at: CUTS.s4 + BEAT * 8.9, src: "1120", vol: 0.9 },
  { at: CUTS.s4 + BEAT * 11.8, src: "2867", vol: 0.45 },
  // all at once
  { at: CUTS.s5, src: "772", vol: 0.55, peak: 0.49 },
  { at: CUTS.s5 + BEAT * 1.5, src: "772", vol: 0.55, peak: 0.49 },
  { at: CUTS.s5 + BEAT * 3, src: "1492", vol: 0.45, peak: 1.1 },
  { at: CUTS.s5 + BEAT * 3 + 0.45, src: "3005", vol: 0.5 },
  // research
  { at: CUTS.s6, src: "1490", vol: 0.35, peak: 0.71 },
  { at: CUTS.s6 + BEAT * 2.6, src: "1120", vol: 0.8 },
  { at: CUTS.s6 + BEAT * 4.1, src: "1120", vol: 0.8 },
  { at: CUTS.s6 + BEAT * 5.6, src: "1120", vol: 0.8 },
  { at: CUTS.s6 + BEAT * 5.2, src: "2350", vol: 0.25, peak: 0.45 },
  { at: CUTS.s6 + BEAT * 8, src: "3114", vol: 0.55, peak: 0.34 },
  // documents
  { at: CUTS.s7, src: "166", vol: 0.35, peak: 0.31 },
  ...[0, 1, 2, 3, 4].map((i) => ({ at: CUTS.s7 + BEAT * (0.5 + i * 0.5) + 0.35, src: "2358", vol: 0.35 })),
  { at: CUTS.s7 + BEAT * 4.6, src: "3120", vol: 0.5 },
  // integrations
  { at: CUTS.s8, src: "2350", vol: 0.3, peak: 0.45 },
  { at: CUTS.s8 + BEAT * 5.2, src: "1490", vol: 0.35, peak: 0.71 },
  { at: CUTS.s8 + BEAT * 5.2 + 1.35, src: "2568", vol: 0.8 },
  { at: CUTS.s8 + BEAT * 5.2 + 1.45, src: "2867", vol: 0.5 },
  // key
  { at: CUTS.s9, src: "166", vol: 0.35, peak: 0.31 },
  { at: CUTS.s9 + BEAT * 1.5, src: "1397", vol: 0.5, len: 0.75 },
  { at: CUTS.s9 + BEAT * 4.2, src: "1120", vol: 1 },
  // end card
  { at: CUTS.s10, src: "1143", vol: 0.7, peak: 0.59 },
  { at: CUTS.s10 + 0.5, src: "2350", vol: 0.35, peak: 0.45 },
  { at: CUTS.s10 + BEAT * 2, src: "1492", vol: 0.3, peak: 1.1 },
];

const Sound: React.FC = () => (
  <>
    <Audio
      src={staticFile("music.mp3")}
      volume={(fr) => {
        const s = fr / FPS;
        const fadeIn = interpolate(s, [0, 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const fadeOut = interpolate(s, [CUTS.s11 + 0.2, CUTS.end - 0.1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return 0.85 * fadeIn * fadeOut;
      }}
    />
    {CUES.map((c, i) => {
      const start = c.at - (c.peak ?? 0);
      const from = Math.max(0, f(start));
      const trimBefore = f(c.trim ?? 0) + (start < 0 ? f(-start) : 0);
      return (
        <Sequence key={i} from={from} durationInFrames={c.len ? f(c.len) : f(10)}>
          <Audio src={sfx(c.src)} volume={c.vol ?? 0.6} trimBefore={trimBefore || undefined} />
        </Sequence>
      );
    })}
  </>
);

export const LaunchFilm: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Stage />
    <Scene from={CUTS.s1} to={CUTS.s2}>
      <S1Cold dur={CUTS.s2 - CUTS.s1} />
    </Scene>
    <Scene from={CUTS.s2} to={CUTS.s3}>
      <S2Thesis dur={CUTS.s3 - CUTS.s2} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s3} to={CUTS.s4} amt={0}>
      <S3Prompt dur={CUTS.s4 - CUTS.s3} typeStart={TYPE_START} sendAt={SEND_AT} />
    </Scene>
    <Scene from={CUTS.s4} to={CUTS.s5}>
      <S4Orchestrate dur={CUTS.s5 - CUTS.s4} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s5} to={CUTS.s6} amt={0.06}>
      <S5AllAtOnce dur={CUTS.s6 - CUTS.s5} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s6} to={CUTS.s7}>
      <S6Research dur={CUTS.s7 - CUTS.s6} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s7} to={CUTS.s8}>
      <S7Docs dur={CUTS.s8 - CUTS.s7} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s8} to={CUTS.s9}>
      <S8Connect dur={CUTS.s9 - CUTS.s8} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s9} to={CUTS.s10}>
      <S9Key dur={CUTS.s10 - CUTS.s9} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s10} to={CUTS.s11} amt={0.04}>
      <S10End dur={CUTS.s11 - CUTS.s10} beat={BEAT} />
    </Scene>
    <Scene from={CUTS.s11} to={CUTS.end} amt={0.02}>
      <S11Sting dur={CUTS.end - CUTS.s11} />
    </Scene>
    <Flash at={B(0)} strength={0.85} />
    <Flash at={CUTS.s10 + 0.05} strength={0.45} />
    <Vignette />
    <Grain />
    <Sound />
  </AbsoluteFill>
);
