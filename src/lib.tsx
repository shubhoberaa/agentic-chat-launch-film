import React from "react";
import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FPS, MONO, SANS, SERIF } from "./theme";

export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const QUAD = Easing.bezier(0.25, 0.46, 0.45, 0.94);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const IN = Easing.bezier(0.55, 0, 1, 0.45);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** progress 0..1 of a window given in seconds (local to the scene) */
export const prog = (frame: number, startSec: number, durSec: number, ease = EXPO) =>
  interpolate(frame, [startSec * FPS, (startSec + durSec) * FPS], [0, 1], { ...clamp, easing: ease });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Arrival: opacity rides a short quad ramp, transform rides a long expo (≈3x).
 * Two properties never share one curve.
 */
export const useArrive = (atSec: number, opts: { y?: number; x?: number; scale?: number; blur?: number; dur?: number } = {}) => {
  const frame = useCurrentFrame();
  const { y = 34, x = 0, scale = 1, blur = 10, dur = 1.1 } = opts;
  const o = prog(frame, atSec, dur / 3, QUAD);
  const t = prog(frame, atSec, dur, EXPO);
  return {
    opacity: o,
    transform: `translate(${lerp(x, 0, t)}px, ${lerp(y, 0, t)}px) scale(${lerp(scale, 1, t)})`,
    filter: blur ? `blur(${lerp(blur, 0, prog(frame, atSec, dur * 0.55, QUAD))}px)` : undefined,
  } as React.CSSProperties;
};

export const Arrive: React.FC<{
  at: number;
  y?: number;
  x?: number;
  scale?: number;
  blur?: number;
  dur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, y, x, scale, blur, dur, style, children }) => {
  const s = useArrive(at, { y, x, scale, blur, dur });
  return <div style={{ ...style, ...s }}>{children}</div>;
};

/** Split words, each arriving with compressing stagger + deterministic jitter */
export const Words: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number, w: string) => React.CSSProperties | undefined;
  y?: number;
  blur?: number;
}> = ({ text, at, stagger = 0.07, style, wordStyle, y = 40, blur = 14 }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <span style={{ display: "inline", ...style }}>
      {words.map((w, i) => {
        const jitter = random(`w-${text}-${i}`) * 0.03;
        const s = at + Math.pow(i, 0.8) * stagger + jitter;
        const o = prog(frame, s, 0.35, QUAD);
        const t = prog(frame, s, 1.0, EXPO);
        const b = prog(frame, s, 0.55, QUAD);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              transform: `translateY(${lerp(y, 0, t)}px)`,
              filter: `blur(${lerp(blur, 0, b)}px)`,
              marginRight: i < words.length - 1 ? "0.24em" : 0,
              ...(wordStyle ? wordStyle(i, w) : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
};

export const typed = (frame: number, text: string, startSec: number, cps: number) => {
  const n = Math.floor(Math.max(0, (frame / FPS - startSec) * cps));
  return text.slice(0, Math.min(n, text.length));
};

export const Caret: React.FC<{ color?: string; h?: number; w?: number; solid?: boolean }> = ({
  color = C.ink,
  h = 1,
  w = 3,
  solid,
}) => {
  const frame = useCurrentFrame();
  const on = solid || Math.floor(frame / (FPS * 0.5)) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width: w,
        height: `${h}em`,
        background: color,
        opacity: on ? 1 : 0,
        verticalAlign: "-0.12em",
        marginLeft: 4,
        borderRadius: 1,
      }}
    />
  );
};

/** Blue logo tile, split into parts for animation */
export const Logo: React.FC<{
  size: number;
  bubble?: number; // 0..1 draw progress of the chat bubble
  spark?: number; // 0..1 scale of the sparkle
  sheen?: number; // -1..2 sweep position
  id?: string;
}> = ({ size, bubble = 1, spark = 1, sheen = -1, id = "lg" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id={`${id}1`} x1="15.72" x2="84.51" y1="2.586" y2="97.11" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7CC3FF" offset="0" />
        <stop stopColor="#066BFA" offset="1" />
      </linearGradient>
      <linearGradient id={`${id}2`} x1="97.91" x2="1.734" y1="49.67" y2="49.67" gradientUnits="userSpaceOnUse">
        <stop stopColor="#135DCD" offset="0" />
        <stop stopColor="#1569DF" stopOpacity="0.3" offset="1" />
      </linearGradient>
      <linearGradient id={`${id}3`} x1="2" x2="97.67" y1="27.12" y2="27.12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff" stopOpacity="0.8" offset="0" />
        <stop stopColor="#fff" stopOpacity="0.2" offset="1" />
      </linearGradient>
      <linearGradient id={`${id}s`} x1="0" x2="1" y1="0" y2="0.35">
        <stop stopColor="#fff" stopOpacity="0" offset={Math.max(0, sheen - 0.15)} />
        <stop stopColor="#fff" stopOpacity="0.55" offset={Math.min(1, Math.max(0, sheen))} />
        <stop stopColor="#fff" stopOpacity="0" offset={Math.min(1, Math.max(0, sheen + 0.15))} />
      </linearGradient>
      <clipPath id={`${id}c`}>
        <path d="m77.6 0.7h-55.2c-11.6 0-20.9 9.6-20.9 21.4v55.2c0 11.7 9.3 21.3 20.9 21.3h55.2c11.4 0 20.7-9.6 20.7-21.3v-55.2c0-11.8-9.3-21.4-20.7-21.4z" />
      </clipPath>
    </defs>
    <path fill={`url(#${id}1)`} d="m77.6 0.7h-55.2c-11.6 0-20.9 9.6-20.9 21.4v55.2c0 11.7 9.3 21.3 20.9 21.3h55.2c11.4 0 20.7-9.6 20.7-21.3v-55.2c0-11.8-9.3-21.4-20.7-21.4z" />
    <path fill={`url(#${id}2)`} d="m77.6 0.7h-55.2c-11.5 0-20.9 9.6-20.9 21.4v55.2c0 11.7 9.4 21.3 20.9 21.3h55.2c11.4 0 20.7-9.6 20.7-21.3v-55.2c0-11.8-9.3-21.4-20.7-21.4zm19.4 76.2c0 10.9-8.3 20.4-19.4 20.8h-55.2c-10.8 0-20.1-9.1-20.1-20.4v-55.2c0-10.9 9-20.6 20.1-20.6h55.2c10.7 0 19.4 9.3 19.4 20.6v54.8z" />
    <path fill={`url(#${id}3)`} d="m77.6 0.7h-55.2c-11.1 0-20.9 9.4-20.9 21.4v0.9c0.8-11.4 9.8-21.5 20.9-21.5h55.2c10.7 0 19.4 9 20.1 20.6v-0.4c0-12-9-21-20.1-21z" />
    {sheen > -0.5 && sheen < 1.5 ? (
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id}s)`} clipPath={`url(#${id}c)`} />
    ) : null}
    <g
      style={{
        transformOrigin: "50px 55px",
        transform: `scale(${lerp(0.7, 1, bubble)})`,
        opacity: Math.min(1, bubble * 1.6),
      }}
    >
      <path
        fill="#FFFFFF"
        d="m67 68.8c-1.8 0.7-6.9 3.6-16.1 4.2-3.3 0.1-7-0.4-10.2-1.6-0.9-0.4-2-0.6-2.8 0-1.9 1-4.8 2.2-7.9 2.9 0.9-1.7 1.8-4.4 1.9-7.4 0-0.5-0.2-1.6-0.7-2-3.9-4.1-7-9.1-7-15.4-0.1-9.8 9.9-22.6 26.4-22.8 5 0 8.8 0.9 12.6 2.2 1.7 0.6 2.7-1.3 1.3-2.2-3.1-2.3-7.8-4-14.5-4.1-13-0.1-30 8.8-30.5 26.1 0 6.9 2.6 12.7 6.8 17.7 1.3 0.9-0.6 5.3-2.6 10-0.7 1.7 0.7 3.1 2.2 3 4.8-0.4 8.8-1.6 12.8-3.4 0.5-0.3 0.9-0.4 1.6-0.1 8.2 2.2 19.6 2.2 28-4.6 1.6-1.2 0.4-3.3-1.3-2.5z"
      />
    </g>
    <g style={{ transformOrigin: "56px 50px", transform: `scale(${spark}) rotate(${lerp(-90, 0, Math.min(1, spark))}deg)` }}>
      <path
        fill="#FFFFFF"
        d="m67 48.1c-5.2-1.8-7.9-5.1-9-9.4-0.5-2.2-3.7-2.9-4.5 0-0.8 3.9-3.7 7.6-8.5 9.3-2.5 0.7-2.5 4 0 4.5 4.8 1.6 7 4.3 8.4 8.8 0.9 2.5 3.8 2.6 4.5 0.1 1.5-4.3 4.3-7.1 9-8.8 2.3-0.5 2.5-3.6 0.1-4.5z"
      />
    </g>
  </svg>
);

// Arrow artwork box (viewBox units) and its click hotspot, the tip at (1.5,1.5).
const VIEW_W = 13;
const VIEW_H = 15;
const ARROW_SCALE = 40 / VIEW_H; // uniform x/y so the arrow never distorts
const TIP_OFFSET = 1.5 * ARROW_SCALE; // tip → rendered px distance from the svg box corner

/**
 * Mac-style pointer that glides between waypoints (seconds, canvas px).
 *
 * (x, y) is the CLICK HOTSPOT, i.e. the exact canvas pixel the arrow tip sits
 * on — so every waypoint must be the on-screen CENTRE of the thing being
 * clicked (measured from a rendered still, never from the untransformed
 * layout, since scene wrappers scale the content under the cursor).
 * The arrow keeps a uniform scale and its tip is anchored on (x, y).
 */
export const Pointer: React.FC<{ path: { t: number; x: number; y: number }[]; clicks?: number[]; show?: [number, number] }> = ({
  path,
  clicks = [],
  show,
}) => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  let x = path[0].x;
  let y = path[0].y;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (sec >= a.t) {
      const p = prog(frame, a.t, b.t - a.t, INOUT);
      x = lerp(a.x, b.x, p);
      y = lerp(a.y, b.y, p);
    }
  }
  let press = 0;
  let ripple = -1;
  for (const c of clicks) {
    const d = sec - c;
    if (d >= 0 && d < 0.2) press = Math.max(press, d < 0.07 ? d / 0.07 : 1 - (d - 0.07) / 0.13);
    if (d >= 0 && d < 0.6) ripple = d / 0.6;
  }
  const vis = show ? prog(frame, show[0], 0.25, QUAD) * (1 - prog(frame, show[1], 0.25, QUAD)) : 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100, opacity: vis }}>
      {ripple >= 0 ? (
        <div
          style={{
            position: "absolute",
            left: x - 50 * EXPO(ripple),
            top: y - 50 * EXPO(ripple),
            width: 100 * EXPO(ripple),
            height: 100 * EXPO(ripple),
            borderRadius: "50%",
            border: `2px solid rgba(124,195,255,${1 - ripple})`,
          }}
        />
      ) : null}
      <svg
        width={VIEW_W * ARROW_SCALE}
        height={VIEW_H * ARROW_SCALE}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{
          position: "absolute",
          left: x - TIP_OFFSET,
          top: y - TIP_OFFSET,
          transform: `scale(${1 - 0.22 * press})`,
          transformOrigin: `${TIP_OFFSET}px ${TIP_OFFSET}px`,
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
        }}
      >
        <path d="M1.5 1.5 L1.5 13 L4.5 10 L7 15.5 L9 14.5 L6.5 9 L11.5 9 Z" fill="white" stroke="#111" strokeWidth="0.9" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = C.blueSoft }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `rotate(${frame * 9}deg)` }}>
      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" fill="none" />
      <path d="M12 3 a9 9 0 0 1 9 9" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
};

export const Check: React.FC<{ p: number; size?: number; color?: string }> = ({ p, size = 22, color = C.ok }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `scale(${lerp(0.4, 1, EXPO(Math.min(1, p)))})`, opacity: Math.min(1, p * 3) }}>
    <circle cx="12" cy="12" r="11" fill={color} opacity={0.16} />
    <path d="M7 12.5 l3.2 3.2 L17 9" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - Math.min(1, p * 1.3))} />
  </svg>
);

/** Shimmer text for "running" states: a brightness wave travels across the characters */
export const Shimmer: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => {
  const frame = useCurrentFrame();
  const n = text.length;
  const head = (((frame / FPS) * 1.1) % 1.6) * n - 0.3 * n;
  return (
    <span style={style}>
      {text.split("").map((ch, i) => {
        const d = Math.abs(i - head);
        const k = Math.max(0, 1 - d / 6);
        const v = Math.round(lerp(140, 255, k));
        return (
          <span key={i} style={{ color: `rgb(${v},${v},${Math.min(255, v + 8)})` }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

export const T = { SERIF, SANS, MONO };

/** Scene exit: the whole group shrinks + fades ("settle") over the last `dur` seconds */
export const useExit = (endSec: number, dur = 0.28, mode: "settle" | "left" | "up" | "zoom" = "settle") => {
  const frame = useCurrentFrame();
  const p = prog(frame, endSec - dur, dur, IN);
  const o = 1 - prog(frame, endSec - dur, dur, QUAD);
  const tr =
    mode === "settle"
      ? `scale(${lerp(1, 0.94, p)})`
      : mode === "left"
        ? `translateX(${lerp(0, -260, p)}px)`
        : mode === "up"
          ? `translateY(${lerp(0, -140, p)}px)`
          : `scale(${lerp(1, 1.18, p)})`;
  return { opacity: o, transform: tr, filter: `blur(${lerp(0, 8, p)}px)` } as React.CSSProperties;
};

export const Full: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>{children}</div>
);

export const useSec = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
