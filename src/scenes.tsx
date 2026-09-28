import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ArrowUp, ChevronDown, Plus, Globe, FileText, Sparkles, Search, Code2, Calculator, KeyRound, Lock, Paperclip } from "lucide-react";
import { C, FPS, MONO, SANS, SERIF } from "./theme";
import { Arrive, Caret, Check, EXPO, Full, INOUT, IN, Logo, Pointer, QUAD, Shimmer, Spinner, Words, lerp, prog, typed, useExit } from "./lib";
import { AppIcon, OpenAIIcon } from "./icons";

const serif = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SERIF,
  fontSize: size,
  fontWeight: 400,
  letterSpacing: "-0.02em",
  lineHeight: 1.0,
  color: C.ink,
  ...extra,
});
const sans = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: size,
  color: C.ink,
  ...extra,
});
const mono = (size: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  color: C.muted,
  ...extra,
});

/* ───────────────────────── S1 · cold open ───────────────────────── */
export const S1Cold: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const text = typed(frame, "Ask once.", 0.9, 11);
  const ex = useExit(dur, 0.22, "settle");
  const push = lerp(1, 1.06, prog(frame, 0, dur, INOUT));
  return (
    <Full style={{ ...ex }}>
      <div style={{ ...serif(180), transform: `scale(${push})` }}>
        {text}
        <Caret h={0.9} w={6} solid={text.length > 0 && text.length < 9} color={C.blueSoft} />
      </div>
    </Full>
  );
};

/* ───────────────────────── S2 · thesis ───────────────────────── */
export const S2Thesis: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const lines = ["Agents search the web,", "split the work,", "and run tools in parallel."];
  const at = [0.02, beat * 3, beat * 6];
  const ex = useExit(dur, 0.3, "up");
  return (
    <Full style={{ ...ex }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start", marginLeft: -120, transform: `translateY(${lerp(90, -40, prog(frame, 0, dur, INOUT))}px)` }}>
        {lines.map((l, i) => {
          const next = at[i + 1];
          const dimP = next ? prog(frame, next, 0.5, QUAD) : 0;
          return (
            <div key={i} style={{ ...serif(118), color: `rgba(242,242,242,${lerp(1, 0.32, dimP)})` }}>
              <Words
                text={l}
                at={at[i]}
                stagger={0.06}
                wordStyle={(wi, w) => (i === 2 && wi >= 3 ? { fontStyle: "italic", color: i === 2 ? C.blueSoft : undefined } : undefined)}
              />
            </div>
          );
        })}
      </div>
    </Full>
  );
};

/* ───────────────────────── Composer (app replica) ───────────────────────── */
export const Composer: React.FC<{ text: string; placeholder?: boolean; caret?: boolean; sendHot?: number; width?: number; scale?: number }> = ({
  text,
  placeholder,
  caret,
  sendHot = 0,
  width = 1320,
}) => (
  <div
    style={{
      width,
      borderRadius: 44,
      border: "1.5px solid rgba(255,255,255,0.10)",
      background: "rgb(24,24,27)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.35), 0 40px 120px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
      padding: "34px 30px 22px",
    }}
  >
    <div style={{ ...sans(38, { lineHeight: 1.42, minHeight: 108, padding: "0 10px", color: placeholder ? "#77777d" : C.ink }) }}>
      {placeholder ? "Ask me anything..." : text}
      {caret ? <Caret h={1.05} w={3} /> : null}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#8a8a90" }}>
        <Plus size={32} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, ...sans(27, { color: "rgba(242,242,242,0.82)", fontWeight: 500 }), padding: "0 16px" }}>
        <OpenAIIcon size={28} />
        GPT-5.6 Sol
        <ChevronDown size={24} style={{ opacity: 0.6 }} />
      </div>
      <div
        style={{
          width: 66,
          height: 66,
          borderRadius: 33,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `rgba(${lerp(255, 242, sendHot)},${lerp(255, 242, sendHot)},${lerp(255, 242, sendHot)},${lerp(0.08, 1, sendHot)})`,
          color: sendHot > 0.5 ? "#000" : "#8a8a90",
          transform: `scale(${1 + 0.06 * sendHot})`,
        }}
      >
        <ArrowUp size={32} strokeWidth={2.4} />
      </div>
    </div>
  </div>
);

export const PROMPT = "Search for the top 3 AI dev tools this week, scrape each homepage, then post a comparison table to Slack.";

/* ───────────────────────── S3 · the prompt ───────────────────────── */
export const S3Prompt: React.FC<{ dur: number; typeStart: number; sendAt: number }> = ({ dur, typeStart, sendAt }) => {
  const frame = useCurrentFrame();
  const cps = PROMPT.length / (sendAt - typeStart - 0.45);
  const text = typed(frame, PROMPT, typeStart, cps);
  const enterScale = lerp(0.82, 1, prog(frame, 0, 1.4, EXPO));
  const rotX = lerp(16, 0, prog(frame, 0, 1.6, EXPO));
  const op = prog(frame, 0, 0.35, QUAD);
  const push = lerp(1, 1.1, prog(frame, 0.8, dur - 0.8, INOUT));
  const sendHot = prog(frame, sendAt - 0.35, 0.2, QUAD);
  // anticipation: pull back just before the drop, then punch through
  const ant = prog(frame, sendAt + 0.05, dur - sendAt - 0.1, IN);
  const punch = lerp(1, 2.6, ant);
  const exitO = 1 - prog(frame, dur - 0.14, 0.14, QUAD);
  return (
    <Full style={{ perspective: 1800, opacity: exitO }}>
      <div style={{ position: "absolute", top: 205, width: "100%", textAlign: "center" }}>
        <Arrive at={0.35} y={20}>
          <div style={{ ...serif(64, { color: "rgba(242,242,242,0.9)" }) }}>
            One prompt. <span style={{ fontStyle: "italic", color: C.muted }}>Executed step by step.</span>
          </div>
        </Arrive>
      </div>
      <div
        style={{
          marginTop: 150,
          opacity: op,
          transform: `rotateX(${rotX}deg) scale(${enterScale * push * punch})`,
          transformOrigin: "50% 40%",
          filter: `blur(${lerp(0, 18, ant)}px)`,
        }}
      >
        <Composer text={text} placeholder={text.length === 0} caret={text.length > 0} sendHot={sendHot} />
      </div>
      <Pointer
        path={[
          { t: 0.5, x: 1500, y: 980 },
          { t: 1.2, x: 500, y: 553 },
          { t: sendAt - 1.1, x: 640, y: 553 },
          { t: sendAt - 0.08, x: 1614.5, y: 693.5 },
        ]}
        clicks={[1.25, sendAt]}
        show={[0.45, sendAt + 0.25]}
      />
    </Full>
  );
};

/* ───────────────────────── Tool row (app's tool activity) ───────────────────────── */
const ToolRow: React.FC<{
  at: number;
  doneAt: number;
  icon: React.ReactNode;
  label: string;
  detail: string;
  done: string;
  indent?: number;
}> = ({ at, doneAt, icon, label, detail, done, indent = 0 }) => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const isDone = sec >= doneAt;
  return (
    <Arrive at={at} y={22} blur={6} dur={0.9} style={{ marginLeft: indent }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "18px 24px",
          borderRadius: 20,
          border: `1.5px solid ${isDone ? "rgba(143,211,166,0.18)" : C.line}`,
          background: "rgba(255,255,255,0.035)",
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...sans(27, { fontWeight: 500 }) }}>
            {isDone ? label : <Shimmer text={label} />}
          </div>
          <div style={{ ...mono(21, { marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>{isDone ? done : detail}</div>
        </div>
        {isDone ? <Check p={prog(frame, doneAt, 0.5, QUAD)} size={36} /> : <Spinner size={32} />}
      </div>
    </Arrive>
  );
};

const Eyebrow: React.FC<{ text: string; at: number }> = ({ text, at }) => (
  <Arrive at={at} y={14} blur={0}>
    <div style={{ ...sans(24, { fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted, display: "flex", alignItems: "center", gap: 14 }) }}>
      <span style={{ width: 10, height: 10, borderRadius: 5, background: C.blue, boxShadow: `0 0 18px ${C.blue}` }} />
      {text}
    </div>
  </Arrive>
);

const Headline: React.FC<{ a: string; b: string; at: number; beat: number; size?: number }> = ({ a, b, at, beat, size = 112 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={serif(size)}>
      <Words text={a} at={at} />
    </div>
    <div style={serif(size, { fontStyle: "italic", color: C.muted })}>
      <Words text={b} at={at + beat} />
    </div>
  </div>
);

/* ───────────────────────── S4 · orchestration (the drop) ───────────────────────── */
export const S4Orchestrate: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const b = (n: number) => n * beat;
  const panelIn = prog(frame, 0, 1.3, EXPO);
  const ex = useExit(dur, 0.3, "left");
  const drift = lerp(0, -30, prog(frame, 0, dur, INOUT));
  const lineP = (s: number) => prog(frame, s, 0.5, EXPO);
  const RESP = "Done. Comparison table posted to #product on Slack: Cursor leads on code UX, v0 on design-to-code speed, Devin on autonomous task completion.";
  const resp = typed(frame, RESP, b(12.4), 60);
  return (
    <Full style={{ ...ex, perspective: 2000 }}>
      <div style={{ position: "absolute", left: 130, top: 330, width: 640 }}>
        <Eyebrow text="Orchestration" at={0.15} />
        <div style={{ height: 36 }} />
        <Headline a="Delegates" b="like a team." at={0.25} beat={beat} />
        <Arrive at={b(3)} y={20}>
          <div style={{ ...sans(30, { color: "rgba(242,242,242,0.62)", lineHeight: 1.45, marginTop: 44, width: 560 }) }}>
            Breaks the task into subtasks, routes each to the right agent, and assembles the result.
          </div>
        </Arrive>
      </div>
      <div
        style={{
          position: "absolute",
          right: 110,
          top: 150 + drift,
          width: 960,
          opacity: prog(frame, 0, 0.3, QUAD),
          transform: `translateX(${lerp(260, 0, panelIn)}px) rotateY(${lerp(-18, -5, panelIn)}deg) scale(${lerp(0.9, 1, panelIn)})`,
          transformOrigin: "100% 50%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ maxWidth: 800, ...sans(26, { lineHeight: 1.45 }), padding: "18px 26px", borderRadius: "30px 30px 10px 30px", background: "#222329", border: "1.5px solid rgba(255,255,255,0.12)" }}>
            {PROMPT}
          </div>
        </div>
        <Arrive at={b(1)} y={10} blur={0}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "10px 0 2px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: "#14161a", border: "1.5px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Logo size={30} id="av" />
            </div>
            <span style={sans(26, { fontWeight: 600, color: "rgba(242,242,242,0.68)" })}>Agentic Chat</span>
          </div>
        </Arrive>
        <ToolRow at={b(1.5)} doneAt={b(4)} icon={<Globe size={24} />} label="Searching the web" detail="top AI developer tools launched this week" done="3 results · cursor.sh · v0.dev · devin.ai" />
        <div style={{ position: "relative", paddingLeft: 56, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* tree connector */}
          <svg style={{ position: "absolute", left: 18, top: -12, overflow: "visible" }} width={40} height={300}>
            {[46, 146, 246].map((y, i) => (
              <path
                key={i}
                d={`M4 0 L4 ${y - 10} Q4 ${y} 16 ${y} L36 ${y}`}
                stroke="rgba(124,195,255,0.55)"
                strokeWidth={2.2}
                fill="none"
                strokeDasharray={400}
                strokeDashoffset={400 * (1 - lineP(b(4.4) + i * 0.05))}
              />
            ))}
          </svg>
          {[
            ["cursor.sh", "Cursor: AI-first code editor with inline edits."],
            ["v0.dev", "v0: Generate UI from text prompts."],
            ["devin.ai", "Devin: Autonomous software engineer."],
          ].map(([u, r], i) => (
            <ToolRow key={u} at={b(4.5) + i * 0.04} doneAt={b(7.5 + i * 0.7)} icon={<FileText size={22} />} label={`Scraping ${u}`} detail={`https://${u}`} done={r} />
          ))}
        </div>
        <ToolRow at={b(9.5)} doneAt={b(11.8)} icon={<AppIcon name="slack" size={26} />} label="Posting to Slack" detail="#product · AI dev tools comparison table" done="Message sent successfully" />
        <div style={{ ...sans(27, { lineHeight: 1.5, color: "rgba(242,242,242,0.9)", minHeight: 90, padding: "6px 6px 0" }) }}>
          {resp}
          {resp.length > 0 && resp.length < RESP.length ? <Caret h={1} w={3} solid /> : null}
        </div>
      </div>
    </Full>
  );
};

/* ───────────────────────── S5 · all tools at once ───────────────────────── */
export const S5AllAtOnce: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const phase = sec < beat * 1.5 ? 0 : sec < beat * 3 ? 1 : 2;
  const pills = [
    { i: <Search size={34} />, t: "Web search", a: -150 },
    { i: <Code2 size={34} />, t: "Code", a: -30 },
    { i: <FileText size={34} />, t: "Documents", a: 30 },
    { i: <Calculator size={34} />, t: "Calculations", a: 150 },
  ];
  const ex = useExit(dur, 0.2, "zoom");
  const kick = (s: number) => lerp(1.12, 1, prog(frame, s, 0.5, EXPO));
  return (
    <Full style={{ ...ex }}>
      {phase === 0 ? <div style={{ ...serif(250), transform: `scale(${kick(0)})` }}>All tools.</div> : null}
      {phase === 1 ? (
        <div style={{ ...serif(250, { fontStyle: "italic", color: C.blueSoft }), transform: `scale(${kick(beat * 1.5)})` }}>At once.</div>
      ) : null}
      {phase === 2 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 70 }}>
          <div style={{ display: "flex", gap: 28 }}>
            {pills.map((p, k) => {
              const s0 = beat * 3 + k * 0.035;
              const t = prog(frame, s0, 0.9, EXPO);
              const doneAt = beat * 3 + 0.45 + k * 0.1;
              return (
                <div
                  key={k}
                  style={{
                    opacity: prog(frame, s0, 0.2, QUAD),
                    transform: `translateY(${lerp(60, 0, t)}px) scale(${lerp(0.85, 1, t)})`,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "26px 34px",
                    borderRadius: 28,
                    background: "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${sec > doneAt ? "rgba(143,211,166,0.3)" : "rgba(255,255,255,0.14)"}`,
                    ...sans(38, { fontWeight: 500 }),
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: C.blueSoft, display: "flex" }}>{p.i}</span>
                  {p.t}
                  <span style={{ marginLeft: 6, display: "flex", width: 38, justifyContent: "center" }}>
                    {sec > doneAt ? <Check p={prog(frame, doneAt, 0.4, QUAD)} size={38} /> : <Spinner size={32} />}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ ...serif(72, { color: C.muted, fontStyle: "italic" }) }}>
            <Words text="Results land together." at={beat * 3.6} />
          </div>
        </div>
      ) : null}
    </Full>
  );
};

/* ───────────────────────── S6 · deep research ───────────────────────── */
export const S6Research: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const b = (n: number) => n * beat;
  const plan = [
    "Benchmark accuracy across GSM8K, MATH, HumanEval",
    "Scale threshold effects from 7B to 70B",
    "Self-consistency and its cost tradeoffs",
  ];
  const sources = ["arxiv.org", "crfm.stanford.edu", "scale.com", "paperswithcode.com", "lmsys.org", "openai.com", "arxiv.org/abs/2203"];
  const cardIn = prog(frame, b(8), 1.2, EXPO);
  const count = Math.round(interpolate(frame, [b(8.6) * FPS, (b(8.6) + 1.2) * FPS], [0, 15.6 * 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EXPO })) / 10;
  const planOut = prog(frame, b(7.6), 0.6, INOUT);
  const ex = useExit(dur, 0.3, "settle");
  return (
    <Full style={{ ...ex }}>
      <div style={{ position: "absolute", left: 130, top: 360, width: 640 }}>
        <Eyebrow text="Deep research" at={0.1} />
        <div style={{ height: 36 }} />
        <Headline a="Plans before" b="it searches." at={0.2} beat={beat} />
        <Arrive at={b(3)} y={20}>
          <div style={{ ...sans(30, { color: "rgba(242,242,242,0.62)", lineHeight: 1.45, marginTop: 44, width: 560 }) }}>
            Builds a plan, collects sources, cross-validates claims, then writes a grounded answer.
          </div>
        </Arrive>
      </div>
      <div style={{ position: "absolute", right: 110, top: 250, width: 980, height: 800 }}>
        {/* plan card */}
        <div style={{ position: "absolute", inset: 0, opacity: 1 - planOut, transform: `translateY(${lerp(0, -80, planOut)}px) scale(${lerp(1, 0.94, planOut)})` }}>
          <Arrive at={0.3} y={40}>
            <div style={{ padding: 48, borderRadius: 32, background: "rgba(255,255,255,0.035)", border: `1.5px solid ${C.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, ...sans(30, { fontWeight: 600 }) }}>
                <Sparkles size={30} color={C.blueSoft} /> Research plan
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 36 }}>
                {plan.map((p, i) => {
                  const at = b(1 + i * 1.5);
                  const doneAt = at + b(1.6);
                  const t = typed(frame, p, at, 55);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: prog(frame, at, 0.2, QUAD) }}>
                      <div style={{ ...mono(24, { color: C.dim, width: 40 }) }}>{`0${i + 1}`}</div>
                      <div style={{ flex: 1, ...sans(32, { color: frame / FPS > doneAt ? C.ink : "rgba(242,242,242,0.75)" }) }}>{t}</div>
                      {frame / FPS > doneAt ? <Check p={prog(frame, doneAt, 0.4, QUAD)} size={36} /> : <Spinner size={30} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </Arrive>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 34 }}>
            {sources.map((s, i) => (
              <Arrive key={s} at={b(5.2) + Math.pow(i, 0.8) * 0.09} y={30} scale={0.8} dur={0.8}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 22px", borderRadius: 999, border: `1.5px solid ${C.line}`, background: "rgba(255,255,255,0.04)", ...mono(23, { color: "rgba(242,242,242,0.8)" }) }}>
                  <Globe size={20} color={C.blueSoft} />
                  {s}
                </div>
              </Arrive>
            ))}
          </div>
        </div>
        {/* answer card */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 40,
            opacity: prog(frame, b(8), 0.3, QUAD),
            transform: `translateY(${lerp(120, 0, cardIn)}px) scale(${lerp(0.92, 1, cardIn)})`,
            padding: 52,
            borderRadius: 36,
            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
            border: `1.5px solid ${C.line}`,
            boxShadow: "0 60px 140px -40px rgba(6,107,250,0.35)",
          }}
        >
          <div style={{ ...serif(50, { lineHeight: 1.12 }) }}>Chain-of-thought prompting: effect on reasoning accuracy</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 44 }}>
            <div style={{ ...serif(170, { color: C.blueSoft, lineHeight: 0.85 }) }}>+{count.toFixed(1)}</div>
            <div style={{ ...sans(32, { color: C.muted, paddingBottom: 14, lineHeight: 1.3 }) }}>
              points on GSM8K
              <br />
              with CoT prompting
            </div>
          </div>
          <div style={{ height: 1.5, background: C.line, margin: "40px 0 26px" }} />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {["Wei et al. 2022", "HELM · Stanford", "Scale SEAL"].map((c, i) => (
              <Arrive key={c} at={b(10) + i * 0.1} y={16} blur={0} dur={0.7}>
                <div style={{ ...mono(22, { color: "rgba(242,242,242,0.78)" }), padding: "10px 18px", borderRadius: 12, background: "rgba(124,195,255,0.08)", border: "1.5px solid rgba(124,195,255,0.22)" }}>
                  [{i + 1}] {c}
                </div>
              </Arrive>
            ))}
          </div>
        </div>
      </div>
    </Full>
  );
};

/* ───────────────────────── S7 · documents ───────────────────────── */
export const S7Docs: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const b = (n: number) => n * beat;
  const files = [
    { n: "Q3-report.pdf", k: "PDF", c: "#ff6b5e" },
    { n: "roadmap.docx", k: "DOCX", c: "#5aa3ff" },
    { n: "revenue.xlsx", k: "XLSX", c: "#5ed39a" },
    { n: "users.csv", k: "CSV", c: "#e6c35c" },
    { n: "whiteboard.png", k: "PNG", c: "#c08bff" },
  ];
  const gather = prog(frame, b(4), 0.9, INOUT);
  const answerIn = prog(frame, b(4.6), 1.1, EXPO);
  const ex = useExit(dur, 0.28, "left");
  return (
    <Full style={{ ...ex }}>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center" }}>
        <div style={serif(110)}>
          <Words text="Your documents," at={0.05} />{" "}
          <span style={{ fontStyle: "italic", color: C.muted }}>
            <Words text="cited." at={b(2)} />
          </span>
        </div>
      </div>
      {files.map((fl, i) => {
        const at = b(0.5) + i * b(0.5);
        const t = prog(frame, at, 1.0, EXPO);
        const fanX = (i - 2) * 340;
        const fanR = (i - 2) * 5;
        const tx = lerp(fanX, -392 + i * 196, gather);
        const ty = lerp(0, -250, gather);
        const sc = lerp(1, 0.58, gather);
        return (
          <div
            key={fl.n}
            style={{
              position: "absolute",
              left: 960,
              top: 640,
              opacity: prog(frame, at, 0.25, QUAD),
              transform: `translate(-50%,-50%) translate(${tx}px, ${ty + lerp(-260, 0, t)}px) rotate(${lerp(fanR * 3, fanR, t) * (1 - gather)}deg) scale(${sc})`,
              width: 300,
              padding: "34px 30px",
              borderRadius: 26,
              background: "#111113",
              border: `1.5px solid ${C.line}`,
              boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ width: 70, height: 84, borderRadius: 12, background: `${fl.c}22`, border: `1.5px solid ${fl.c}66`, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10, ...mono(18, { color: fl.c, fontWeight: 500 }) }}>{fl.k}</div>
            <div style={{ ...sans(28, { marginTop: 24, fontWeight: 500, whiteSpace: "nowrap" }) }}>{fl.n}</div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 470,
          width: 1260,
          opacity: prog(frame, b(4.6), 0.3, QUAD),
          transform: `translateX(${lerp(160, 0, answerIn)}px)`,
          padding: 46,
          borderRadius: 34,
          background: "rgba(255,255,255,0.035)",
          border: `1.5px solid ${C.line}`,
        }}
      >
        <div style={{ ...sans(40, { lineHeight: 1.5, color: "rgba(242,242,242,0.9)" }) }}>
          Q3 revenue grew <span style={{ background: "rgba(124,195,255,0.18)", color: "#fff", padding: "0 8px", borderRadius: 8 }}>18% quarter over quarter</span>, led by enterprise plans, while churn held under 2%.
          <sup style={{ ...mono(20, { color: C.blueSoft }) }}> [1]</sup>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
          <Arrive at={b(6.5)} y={14} blur={0} dur={0.7}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: `1.5px solid ${C.line}`, ...mono(22, { color: C.ink }) }}>
              <Paperclip size={20} /> Q3-report.pdf · p.12
            </div>
          </Arrive>
          <Arrive at={b(7)} y={14} blur={0} dur={0.7}>
            <div style={{ padding: "12px 20px", borderRadius: 14, background: "rgba(143,211,166,0.12)", border: "1.5px solid rgba(143,211,166,0.3)", ...mono(22, { color: C.ok }) }}>94% match</div>
          </Arrive>
          <Arrive at={b(7.5)} y={14} blur={0} dur={0.7}>
            <div style={{ padding: "12px 20px", borderRadius: 14, ...mono(22, { color: C.muted }) }}>hybrid retrieval · reranked</div>
          </Arrive>
        </div>
      </div>
    </Full>
  );
};

/* ───────────────────────── S8 · integrations + human in the loop ───────────────────────── */
export const S8Connect: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const b = (n: number) => n * beat;
  const apps = ["gmail", "calendar", "drive", "docs", "sheets", "slack", "notion", "github", "linear"];
  const spin = frame / FPS * 6;
  const cardAt = b(5.2);
  const recede = prog(frame, cardAt - 0.1, 0.8, INOUT);
  const cardIn = prog(frame, cardAt, 1.0, EXPO);
  const approveAt = cardAt + 1.35;
  const approved = frame / FPS > approveAt;
  const ex = useExit(dur, 0.25, "settle");
  return (
    <Full style={{ ...ex }}>
      <div style={{ position: "absolute", inset: 0, opacity: lerp(1, 0.28, recede), filter: `blur(${lerp(0, 10, recede)}px)`, transform: `scale(${lerp(1, 0.9, recede)})` }}>
        <div style={{ position: "absolute", left: 960, top: 460, transform: `translate(-50%,-50%) scale(${lerp(0.6, 1, prog(frame, 0, 1.0, EXPO))})`, opacity: prog(frame, 0, 0.3, QUAD) }}>
          <div style={{ position: "absolute", inset: -80, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,107,250,0.45), transparent 65%)" }} />
          <Logo size={180} id="hub" />
        </div>
        <svg style={{ position: "absolute", inset: 0 }} width={1920} height={1080}>
          {apps.map((a, i) => {
            const ang = ((i / apps.length) * 360 + spin - 90) * (Math.PI / 180);
            const at = b(0.5) + i * 0.11;
            const t = prog(frame, at, 1.1, EXPO);
            const R = lerp(120, 360, t);
            const x = 960 + Math.cos(ang) * R * 1.35;
            const y = 460 + Math.sin(ang) * R * 0.9;
            return <line key={a} x1={960} y1={460} x2={x} y2={y} stroke="rgba(124,195,255,0.22)" strokeWidth={2} strokeDasharray="6 10" strokeDashoffset={-frame * 1.2} opacity={prog(frame, at + 0.2, 0.3, QUAD)} />;
          })}
        </svg>
        {apps.map((a, i) => {
          const ang = ((i / apps.length) * 360 + spin - 90) * (Math.PI / 180);
          const at = b(0.5) + i * 0.11;
          const t = prog(frame, at, 1.1, EXPO);
          const R = lerp(120, 360, t);
          const x = 960 + Math.cos(ang) * R * 1.35;
          const y = 460 + Math.sin(ang) * R * 0.9;
          return (
            <div
              key={a}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%,-50%) scale(${lerp(0.3, 1, t)})`,
                opacity: prog(frame, at, 0.25, QUAD),
                width: 120,
                height: 120,
                borderRadius: 32,
                background: "#111113",
                border: `1.5px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8)",
              }}
            >
              <AppIcon name={a} size={60} />
            </div>
          );
        })}
        <div style={{ position: "absolute", bottom: 48, width: "100%", textAlign: "center", ...serif(72) }}>
          <Words text="Connected to" at={b(2)} /> <span style={{ fontStyle: "italic", color: C.muted }}><Words text="where you work." at={b(3)} /></span>
        </div>
      </div>
      {/* human-in-the-loop approval card */}
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 520,
          width: 980,
          opacity: prog(frame, cardAt, 0.3, QUAD),
          transform: `translate(-50%,-50%) translateY(${lerp(120, 0, cardIn)}px) scale(${lerp(0.9, 1, cardIn)})`,
          padding: 48,
          borderRadius: 36,
          background: "#101012",
          border: `1.5px solid ${C.line}`,
          boxShadow: "0 60px 140px -30px rgba(0,0,0,0.9)",
        }}
      >
        <div style={{ ...sans(24, { fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted }) }}>Needs your approval</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 26 }}>
          <AppIcon name="slack" size={48} />
          <div style={serif(56)}>Post comparison to #product?</div>
        </div>
        <div style={{ ...mono(24, { marginTop: 18 }) }}>SLACK_SEND_MESSAGE · channel: #product</div>
        <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
          <div style={{ padding: "20px 44px", borderRadius: 999, background: approved ? C.ok : C.ink, color: "#000", ...sans(30, { color: "#000", fontWeight: 600 }), display: "flex", alignItems: "center", gap: 12, transform: `scale(${approved ? lerp(0.94, 1, prog(frame, approveAt, 0.4, EXPO)) : 1})` }}>
            {approved ? "Approved" : "Approve"}
          </div>
          <div style={{ padding: "20px 44px", borderRadius: 999, border: `1.5px solid ${C.line}`, ...sans(30, { fontWeight: 500, color: C.muted }) }}>Edit</div>
          <div style={{ flex: 1 }} />
          {approved ? <Check p={prog(frame, approveAt + 0.1, 0.5, QUAD)} size={64} /> : null}
        </div>
      </div>
      <Pointer
        path={[
          { t: cardAt + 0.3, x: 1400, y: 900 },
          { t: approveAt - 0.05, x: 622.9, y: 620.8 },
        ]}
        clicks={[approveAt]}
        show={[cardAt + 0.3, dur]}
      />
    </Full>
  );
};

/* ───────────────────────── S9 · BYOK ───────────────────────── */
export const S9Key: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const b = (n: number) => n * beat;
  const dots = Math.min(22, Math.max(0, Math.floor((frame / FPS - b(1.5)) * 30)));
  const locked = frame / FPS > b(4.2);
  const lockP = prog(frame, b(4.2), 0.6, EXPO);
  const ex = useExit(dur, 0.25, "zoom");
  return (
    <Full style={{ ...ex, flexDirection: "column" }}>
      <div style={serif(140, { marginTop: -60 })}>
        <Words text="The key" at={0.05} /> <span style={{ fontStyle: "italic", color: C.blueSoft }}><Words text="stays yours." at={b(1)} /></span>
      </div>
      <Arrive at={b(1.2)} y={40} style={{ marginTop: 80 }}>
        <div style={{ width: 1000, display: "flex", alignItems: "center", gap: 22, padding: "30px 36px", borderRadius: 26, background: "rgb(24,24,27)", border: `1.5px solid ${locked ? "rgba(124,195,255,0.4)" : C.line}` }}>
          <KeyRound size={36} color={C.muted} />
          <div style={{ flex: 1, ...mono(38, { color: C.ink, letterSpacing: "0.04em" }) }}>
            sk-{"•".repeat(dots)}
            {!locked ? <Caret h={1} w={3} /> : null}
          </div>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: locked ? "rgba(6,107,250,0.25)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${locked ? lerp(1.3, 1, lockP) : 1})` }}>
            <Lock size={32} color={locked ? C.blueSoft : C.dim} />
          </div>
        </div>
      </Arrive>
      <div style={{ ...mono(28, { marginTop: 36, opacity: prog(frame, b(4.6), 0.4, QUAD) }) }}>AES-256-GCM encrypted · server-side proxy · never exposed to the client</div>
    </Full>
  );
};

/* ───────────────────────── S10 · end card ───────────────────────── */
export const S10End: React.FC<{ dur: number; beat: number }> = ({ dur, beat }) => {
  const frame = useCurrentFrame();
  const b = (n: number) => n * beat;
  const tile = prog(frame, 0, 1.3, EXPO);
  const rot = lerp(-24, 0, prog(frame, 0, 1.6, EXPO));
  const bubble = prog(frame, 0.25, 0.9, EXPO);
  const spark = interpolate(frame, [0.5 * FPS, 0.8 * FPS, 1.2 * FPS], [0, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sheen = lerp(-0.4, 1.6, prog(frame, b(3), 1.1, INOUT));
  // lockup: logo centered, then slides left as the wordmark arrives
  const slide = prog(frame, b(2), 1.2, EXPO);
  const glow = 0.5 + 0.12 * Math.sin(frame / FPS * 2);
  const exitO = 1 - prog(frame, dur - 0.5, 0.5, QUAD);
  return (
    <Full style={{ opacity: exitO, flexDirection: "column" }}>
      <div style={{ position: "absolute", left: 960, top: 470, width: 1100, height: 700, transform: "translate(-50%,-50%)", background: `radial-gradient(ellipse at center, rgba(6,107,250,${glow * 0.55}), transparent 62%)`, opacity: tile }} />
      <div style={{ display: "flex", alignItems: "center", marginTop: -40 }}>
        <div
          style={{
            transform: `scale(${lerp(0.3, 1, tile)}) rotate(${rot}deg)`,
            opacity: prog(frame, 0, 0.2, QUAD),
            filter: `drop-shadow(0 30px 60px rgba(6,107,250,0.45))`,
          }}
        >
          <Logo size={200} bubble={bubble} spark={spark} sheen={sheen} id="end" />
        </div>
        <div style={{ overflow: "hidden", marginLeft: lerp(0, 50, slide), width: lerp(0, 940, slide), paddingRight: 10 }}>
          <div style={{ ...sans(150, { fontWeight: 600, letterSpacing: "-0.045em", whiteSpace: "nowrap", opacity: prog(frame, b(2.2), 0.4, QUAD), transform: `translateX(${lerp(-120, 0, slide)}px)` }) }}>Agentic Chat</div>
        </div>
      </div>
      <div style={{ ...serif(84, { marginTop: 70 }) }}>
        <Words text="Intelligence," at={b(4)} /> <span style={{ fontStyle: "italic", color: C.muted }}><Words text="with context." at={b(5)} /></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 64, opacity: prog(frame, b(7), 0.5, QUAD), transform: `translateY(${lerp(20, 0, prog(frame, b(7), 1, EXPO))}px)` }}>
        <div style={{ padding: "18px 40px", borderRadius: 999, background: C.ink, ...sans(32, { color: "#000", fontWeight: 600 }) }}>agentic.shubhojeet.com</div>
        <div style={{ ...mono(28) }}>open source · github.com/shubho0908/agentic-chat</div>
      </div>
    </Full>
  );
};

/* ───────────────────────── S11 · sting ───────────────────────── */
export const S11Sting: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const o = prog(frame, 0.7, 0.9, QUAD) * (1 - prog(frame, dur - 0.6, 0.6, QUAD));
  return (
    <Full>
      <div style={serif(96, { opacity: o })}>
        Start <span style={{ fontStyle: "italic", color: C.blueSoft }}>chatting.</span>
      </div>
    </Full>
  );
};
