import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { EXPO, INOUT, Pointer } from "./lib";
import { C, FPS, MONO, SANS } from "./theme";
import { SEND_FRAME, SHOTS, TOTAL } from "./timeline";

const OUT = EXPO;
const SMOOTH = INOUT;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const p = (frame: number, from: number, to: number, easing = OUT) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing });
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
const PlusGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ArrowGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CheckGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m5 12.5 4.4 4.3L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CARD = { left: 74, top: 166, width: 1320, height: 220 };
const PROMPT_LINES = [
  ["Compare", "AI", "tools."],
  ["Post", "to", "Slack."],
];
const WORD_STARTS = [-31, -21, -11, 8, 20, 32];

const stageStyle: React.CSSProperties = {
  backgroundColor: C.stage,
  color: C.ink,
  fontFamily: SANS,
};

/** Product chrome stays quiet so the task, not the shell, owns the frame. */
const AppFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: 144,
      top: 78,
      width: 1632,
      height: 924,
      overflow: "hidden",
      borderRadius: 30,
      border: "1px solid rgba(255,255,255,0.12)",
      background: C.card,
      boxShadow: "0 48px 120px rgba(0,0,0,0.5)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: "0 0 auto 0",
        height: 72,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        paddingLeft: 28,
        gap: 10,
      }}
    >
      {[C.muted, C.dim, C.line].map((color, index) => (
        <span key={index} style={{ width: 12, height: 12, borderRadius: 6, background: color, opacity: 0.65 }} />
      ))}
      <div style={{ flex: 1 }} />
      <span style={{ width: 110, height: 9, marginRight: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)" }} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 72,
        bottom: 0,
        width: 82,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 24,
        gap: 18,
      }}
    >
      <div style={{ width: 38, height: 38, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 13, display: "grid", placeItems: "center", color: C.muted }}>
        <PlusGlyph size={19} />
      </div>
      {[0, 1, 2, 3].map((n) => (
        <div key={n} style={{ width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center", background: n === 0 ? "rgba(255,255,255,0.04)" : "transparent" }}>
          <span style={{ width: n === 1 ? 15 : 13, height: n === 1 ? 15 : 13, border: `1.5px solid ${n === 0 ? C.blueSoft : C.line}`, opacity: n === 0 ? 0.78 : 1, borderRadius: n === 1 ? 8 : 4 }} />
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 82, top: 72, right: 0, bottom: 0 }}>{children}</div>
  </div>
);

const WordLine: React.FC<{ words: string[]; starts: number[]; frame: number; top: number; showCaret?: boolean }> = ({ words, starts, frame, top, showCaret = false }) => (
  <div
    style={{
      position: "absolute",
      left: 42,
      top,
      display: "flex",
      gap: 16,
      whiteSpace: "nowrap",
      fontFamily: SANS,
      fontSize: 58,
      fontWeight: 450,
      lineHeight: 1.1,
      letterSpacing: "-0.045em",
    }}
  >
    {words.map((word, i) => {
      const reveal = p(frame, starts[i], starts[i] + 11, SMOOTH);
      return (
        <span key={word} style={{ opacity: reveal, transform: `translateY(${mix(9, 0, reveal)}px)` }}>
          {word}
        </span>
      );
    })}
    {showCaret && top === 104 && frame > WORD_STARTS[5] ? (
      <span
        style={{
          width: 3,
          height: 58,
          marginLeft: -8,
          alignSelf: "center",
          background: C.blueSoft,
          opacity: Math.floor(frame / 18) % 2 === 0 ? 1 : 0,
        }}
      />
    ) : null}
  </div>
);

const PromptCard: React.FC<{ frame: number; sent?: boolean; request?: boolean }> = ({ frame, sent = false, request = false }) => {
  const pressIn = p(frame, SEND_FRAME, SEND_FRAME + 3);
  const pressOut = 1 - p(frame, SEND_FRAME + 3, SEND_FRAME + 9);
  const press = Math.min(pressIn, pressOut);
  const focus = request ? p(frame, 76, SEND_FRAME) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${CARD.left}px, ${CARD.top}px)`,
        width: CARD.width,
        height: CARD.height,
        boxSizing: "border-box",
        borderRadius: 26,
        border: `1px solid rgba(255,255,255,${mix(0.1, 0.18, focus)})`,
        background: C.stage2,
        boxShadow: "0 24px 60px rgba(0,0,0,0.28), inset 0 1px rgba(255,255,255,0.035)",
      }}
    >
      <WordLine words={PROMPT_LINES[0]} starts={WORD_STARTS.slice(0, 3)} frame={request ? frame : 120} top={34} />
      <WordLine words={PROMPT_LINES[1]} starts={WORD_STARTS.slice(3)} frame={request ? frame : 120} top={104} showCaret={request} />
      <div style={{ position: "absolute", left: 26, right: 22, bottom: 18, display: "flex", alignItems: "center", height: 46 }}>
        <div style={{ width: 42, height: 42, borderRadius: 21, display: "grid", placeItems: "center", color: C.muted, border: "1px solid rgba(255,255,255,0.07)" }}>
          <PlusGlyph size={22} />
        </div>
        <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 8, opacity: 0.65 }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: C.blueSoft }} />
          <span style={{ width: 62, height: 7, borderRadius: 4, background: C.line }} />
          <span style={{ width: 8, height: 8, borderRight: `1.5px solid ${C.dim}`, borderBottom: `1.5px solid ${C.dim}`, transform: "translateY(-2px) rotate(45deg)" }} />
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            display: "grid",
            placeItems: "center",
            color: C.ink,
            background: C.blue,
            transform: `scale(${1 - 0.08 * press})`,
            boxShadow: sent ? "inset 0 0 0 1px rgba(255,255,255,0.16)" : "none",
          }}
        >
          {sent ? <CheckGlyph size={27} /> : <ArrowGlyph size={28} />}
        </div>
      </div>
    </div>
  );
};

const RequestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const settle = p(frame, 0, 40);
  return (
    <AbsoluteFill style={stageStyle}>
      <AppFrame>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${mix(10, 0, settle)}px) scale(${mix(1.008, 1, settle)})` }}>
          <PromptCard frame={frame} request />
        </div>
      </AppFrame>
      <Pointer
        path={[
          { t: 0, x: 1690, y: 800 },
          { t: 0.62, x: 1320, y: 555 },
          { t: SEND_FRAME / FPS, x: 1563, y: 486 },
        ]}
        clicks={[SEND_FRAME / FPS]}
        show={[0, 2.48]}
      />
    </AbsoluteFill>
  );
};

const TASKS = [
  { label: "Search", left: 74, arrive: 75, finish: 318 },
  { label: "Compare", left: 534, arrive: 81, finish: 337 },
  { label: "Slack", left: 994, arrive: 87, finish: 354 },
] as const;
const TASK_TOP = 480;
const TASK_WIDTH = 400;
const TASK_HEIGHT = 190;
const TASK_CENTRES = [274, 734, 1194];

const RouteLines: React.FC<{ frame: number }> = ({ frame }) => {
  const trunk = p(frame, 8, 48, SMOOTH);
  const routes = [
    `M734 383 L734 431 Q734 445 720 445 L288 445 Q274 445 274 459 L274 480`,
    "M734 383 L734 480",
    `M734 383 L734 431 Q734 445 748 445 L1180 445 Q1194 445 1194 459 L1194 480`,
  ];
  return (
    <svg style={{ position: "absolute", inset: 0, overflow: "visible", zIndex: 0 }} width={1550} height={852} viewBox="0 0 1550 852">
      {routes.map((d, i) => {
        const reveal = p(frame, 14 + i * 10, 52 + i * 10, SMOOTH);
        return (
          <path
            key={d}
            d={d}
            pathLength={1}
            fill="none"
            stroke={C.blueSoft}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={1}
            strokeDashoffset={1 - reveal}
            opacity={0.7 * trunk}
          />
        );
      })}
      {TASK_CENTRES.map((x, i) => (
        <circle key={x} cx={x} cy={TASK_TOP} r={4} fill={C.blueSoft} opacity={p(frame, 34 + i * 8, 48 + i * 8, SMOOTH) * 0.9} />
      ))}
    </svg>
  );
};

const TaskCard: React.FC<{ frame: number; label: string; left: number; arrive: number; finish: number; index: number }> = ({ frame, label, left, arrive, finish, index }) => {
  const entrance = p(frame, arrive, arrive + 20);
  const work = p(frame, arrive + 20, finish);
  const done = frame >= finish;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: TASK_TOP,
        width: TASK_WIDTH,
        height: TASK_HEIGHT,
        boxSizing: "border-box",
        padding: "28px 28px 22px",
        borderRadius: 22,
        background: C.stage2,
        border: `1px solid rgba(255,255,255,${done ? 0.13 : 0.09})`,
        opacity: entrance,
        transform: `translateY(${mix(14, 0, entrance)}px) scale(${mix(0.985, 1, entrance)})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, height: 38 }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, border: `1px solid ${done ? C.ok : C.line}`, display: "grid", placeItems: "center", color: C.ok, opacity: done ? 0.8 : 1 }}>
          {done ? <CheckGlyph size={20} /> : <span style={{ width: 8, height: 8, borderRadius: 5, background: C.blueSoft, opacity: 0.9 }} />}
        </div>
        <span style={{ fontSize: 31, fontWeight: 500, letterSpacing: "-0.035em", color: C.ink }}>{label}</span>
        <div style={{ flex: 1 }} />
        <span style={{ width: 6, height: 6, borderRadius: 4, background: done ? C.ok : C.line2, opacity: done ? 1 : 0.5 }} />
      </div>
      <div style={{ position: "absolute", left: 28, right: 28, bottom: 28, height: 3, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${work * 100}%`, height: "100%", borderRadius: 3, background: done ? C.ok : C.blueSoft }} />
      </div>
    </div>
  );
};

const ResultCard: React.FC<{ frame: number; large?: boolean; entrance?: number }> = ({ frame, large = false, entrance = 0 }) => {
  const top = large ? mix(700, 300, p(frame, 0, 78)) : 700;
  const width = large ? mix(1320, 1120, p(frame, 0, 78)) : 1320;
  const height = large ? mix(82, 180, p(frame, 0, 78)) : 82;
  const left = (1550 - width) / 2 - 41;
  const size = large ? mix(34, 48, p(frame, 0, 78)) : 34;
  const icon = large ? mix(30, 48, p(frame, 0, 78)) : 30;
  const appear = large ? 1 : p(frame, 420, 443);
  const zoom = large ? p(frame, 0, 78) : 0;
  const nudge = large ? mix(10, 0, zoom) : mix(10, 0, appear);
  const enterOpacity = entrance ? p(frame, 0, 24) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        boxSizing: "border-box",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: large ? mix(18, 30, zoom) : 18,
        background: C.stage2,
        opacity: appear * enterOpacity,
        transform: `translateY(${nudge}px)`,
        display: "flex",
        alignItems: "center",
        padding: `0 ${mix(25, 42, zoom)}px`,
        gap: mix(16, 22, zoom),
      }}
    >
      <div style={{ width: icon + 14, height: icon + 14, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", color: C.ok, flexShrink: 0 }}>
        <CheckGlyph size={icon} />
      </div>
      <span style={{ fontSize: size, fontWeight: 500, letterSpacing: "-0.035em", color: C.ink, whiteSpace: "nowrap" }}>Posted to #product</span>
      <div style={{ flex: 1 }} />
    </div>
  );
};

const monoStyle = (fontSize: number): React.CSSProperties => ({ fontFamily: MONO, fontSize, letterSpacing: "-0.015em" });

const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={stageStyle}>
      <AppFrame>
        <PromptCard frame={frame} sent />
        <RouteLines frame={frame} />
        {TASKS.map((task, index) => (
          <TaskCard key={task.label} frame={frame} index={index} {...task} />
        ))}
        <ResultCard frame={frame} />
      </AppFrame>
    </AbsoluteFill>
  );
};

const ResultScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={stageStyle}>
      <AppFrame>
        <ResultCard frame={frame} large />
      </AppFrame>
    </AbsoluteFill>
  );
};

const LockupScene: React.FC = () => {
  const frame = useCurrentFrame();
  const morph = p(frame, 0, 44);
  const textOut = 1 - p(frame, 0, 18, SMOOTH);
  const markIn = p(frame, 34, 48, SMOOTH);
  const slide = p(frame, 44, 64, OUT);
  const wordmarkIn = p(frame, 52, 64, OUT);
  const urlIn = p(frame, 36, 48, SMOOTH);
  const width = mix(1120, 180, morph);
  const height = 180;
  const radius = mix(30, 42, morph);
  const markX = mix(960, 680, slide);
  const markY = mix(540, 485, slide);
  return (
    <AbsoluteFill style={stageStyle}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          transform: `translate(${markX - width / 2}px, ${markY - height / 2}px)`, 
          borderRadius: radius,
          background: `rgb(${Math.round(mix(17, 6, morph))},${Math.round(mix(20, 107, morph))},${Math.round(mix(25, 250, morph))})`,
          border: `1px solid rgba(255,255,255,${mix(0.12, 0, morph)})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", padding: "0 42px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 22, opacity: textOut }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", color: C.ok, flexShrink: 0 }}>
            <CheckGlyph size={48} />
          </div>
          <span style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-0.035em", whiteSpace: "nowrap" }}>Posted to #product</span>
          <div style={{ flex: 1 }} />
        </div>
        <Img
          src={staticFile("logo.svg")}
          style={{ position: "absolute", width: 180, height: 180, opacity: markIn, transform: `scale(${mix(0.88, 1, markIn)})` }}
        />
      </div>
      <div style={{ position: "absolute", left: 800, top: 443, width: 720, height: 96, display: "flex", alignItems: "center", opacity: wordmarkIn, transform: `translateY(${mix(8, 0, wordmarkIn)}px)` }}>
        <span style={{ fontFamily: SANS, fontSize: 84, fontWeight: 600, letterSpacing: "-0.055em", color: C.ink, whiteSpace: "nowrap" }}>Agentic Chat</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 638,
          textAlign: "center",
          ...monoStyle(44),
          color: C.ink,
          opacity: 0.72 * urlIn,
          transform: `translateY(${mix(8, 0, urlIn)}px)`,
        }}
      >
        agentic.shubhojeet.com
      </div>
    </AbsoluteFill>
  );
};

type Cue = { at: number; src: string; vol: number; frames: number; trim?: number };
const CUES: Cue[] = [
  { at: SEND_FRAME, src: "2568", vol: 0.24, frames: 24, trim: 0.1 },
  { at: SHOTS.workflow.from + 42, src: "1120", vol: 0.22, frames: 24, trim: 0.1 },
  { at: SHOTS.workflow.from + 360, src: "3120", vol: 0.27, frames: 32, trim: 0.1 },
  { at: SHOTS.lockup.from + 30, src: "1143", vol: 0.24, frames: 36, trim: 0.1 },
];

const Soundtrack: React.FC = () => {
  const musicVol = (frame: number) =>
    0.38 *
    interpolate(frame, [0, 12, TOTAL - 96, TOTAL], [0, 1, 1, 0], { ...clamp, easing: SMOOTH });
  return (
    <>
      {/* The original score's drop lands on the send action at 2.37 s. */}
      <Audio src={staticFile("music.mp3")} trimBefore={811} volume={musicVol} />
      {CUES.map((cue) => (
        <Sequence key={`${cue.src}-${cue.at}`} from={cue.at} durationInFrames={cue.frames}>
          <Audio src={staticFile(`sfx/${cue.src}.mp3`)} trimBefore={Math.round((cue.trim ?? 0) * FPS)} volume={cue.vol} />
        </Sequence>
      ))}
    </>
  );
};

export const LaunchFilm: React.FC = () => (
  <AbsoluteFill style={stageStyle}>
    <Sequence from={SHOTS.request.from} durationInFrames={SHOTS.request.duration}>
      <RequestScene />
    </Sequence>
    <Sequence from={SHOTS.workflow.from} durationInFrames={SHOTS.workflow.duration}>
      <WorkflowScene />
    </Sequence>
    <Sequence from={SHOTS.result.from} durationInFrames={SHOTS.result.duration}>
      <ResultScene />
    </Sequence>
    <Sequence from={SHOTS.lockup.from} durationInFrames={SHOTS.lockup.duration}>
      <LockupScene />
    </Sequence>
    <Soundtrack />
  </AbsoluteFill>
);

export { TOTAL };
