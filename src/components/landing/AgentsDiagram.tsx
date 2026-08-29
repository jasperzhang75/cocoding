"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";

/* The agents-card diagram (chips, connectors, verticals) plus its scroll-in
   animation. Vector geometry extracted from Figma via vectorPaths, in PANEL
   coordinates (563x444); the two right-hand connectors are mirrored in the
   design, reproduced with scale(-1,1) groups.

   Sequence, per Jasper's spec — a slow, subtle LOOP started on scroll into
   view:
   1. a #4C8BE9/85 light flows from under the Prompt chip down all four
      connectors,
   2. it dwells briefly at each function chip — every branch a slightly
      different beat, as if thinking — then continues down the verticals,
   3. as it arrives, each agent chip's stroke draws closed downward and the
      chip fades in Agent 2's blue fill,
   4. everything holds, the blue slowly drains away, and after a few quiet
      seconds the cycle plays again.
   prefers-reduced-motion shows the lit end state, no loop. */

const mask = (url: string, size: string, position: string): CSSProperties => ({
  maskImage: `url(${url})`,
  maskSize: size,
  maskPosition: position,
  maskRepeat: "no-repeat",
  WebkitMaskImage: `url(${url})`,
  WebkitMaskSize: size,
  WebkitMaskPosition: position,
  WebkitMaskRepeat: "no-repeat",
});

/* Figma path data, verbatim. Long connectors (to Design / Cloud), short
   connectors (to Plan / Data); both run top -> bottom. */
const CONN_LONG =
  "M 142 0 C 142 0 135.2 27.66 109.63 32.18 C 84.05 36.69 62.65 33.31 36.54 38.39 C 10.44 43.47 0 70 0 70";
const CONN_SHORT =
  "M 52 0 C 52 0 46.08 26.15 32.76 35 C 23.06 41.44 18.17 42.44 9.36 50.24 C 1.89 56.85 0 70 0 70";

const CONNECTORS = [
  { key: "design", d: CONN_LONG, transform: "translate(112,135)" },
  { key: "plan", d: CONN_SHORT, transform: "translate(214,135)" },
  { key: "data", d: CONN_SHORT, transform: "translate(326,135) scale(-1,1)" },
  { key: "cloud", d: CONN_LONG, transform: "translate(428,135) scale(-1,1)" },
];

const VERTICAL_X = [111, 213, 325, 428];

const AGENTS = [
  { label: "Agent 1", x: 76 },
  { label: "Agent 2", x: 177 },
  { label: "Agent 3", x: 288 },
  { label: "Agent 4", x: 394 },
];
const AGENT_Y = 299;
const AGENT_W = 71;
const AGENT_H = 32;
const R = 6;

/* Half-perimeter of the chip outline, from top-center down one side to
   bottom-center; mirrored for the other side. */
const halfOutline = (x: number, y: number, dir: 1 | -1) => {
  const cx = x + AGENT_W / 2;
  const edge = dir === 1 ? x + AGENT_W : x;
  const inner = dir === 1 ? edge - R : edge + R;
  return [
    `M ${cx} ${y}`,
    `H ${inner}`,
    `Q ${edge} ${y} ${edge} ${y + R}`,
    `V ${y + AGENT_H - R}`,
    `Q ${edge} ${y + AGENT_H} ${inner} ${y + AGENT_H}`,
    `H ${cx}`,
  ].join(" ");
};

const CHIP =
  "absolute flex h-8 items-center justify-center rounded-sm text-label-sm text-text-primary";

export default function AgentsDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lights = [...root.querySelectorAll<SVGPathElement>("[data-light]")];
    const strokes = [...root.querySelectorAll<SVGPathElement>("[data-agent-stroke]")];
    const fills = [...root.querySelectorAll<HTMLElement>("[data-agent-fill]")];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      strokes.forEach((p) => p.style.removeProperty("stroke-dasharray"));
      gsap.set(strokes, { strokeDashoffset: 0, opacity: 1 });
      gsap.set(fills, { opacity: 1 });
      return;
    }

    const SEG = 30;
    const len = (p: SVGPathElement) => p.getTotalLength();
    lights.forEach((p) => {
      p.style.strokeDasharray = `${SEG} ${len(p) + SEG}`;
      p.style.strokeDashoffset = `${SEG}`;
    });
    strokes.forEach((p) => {
      p.style.strokeDasharray = `${len(p)}`;
      p.style.strokeDashoffset = `${len(p)}`;
    });
    gsap.set(fills, { opacity: 0 });

    /* DOM order: lights = 4 connectors then 4 verticals (one hairline path
       each); strokes = per agent (left, right); one fill per agent. Branch i
       feeds agent i. */
    const branch = (i: number) => ({
      conn: lights[i],
      vert: lights[4 + i],
      strokes: strokes.slice(i * 2, i * 2 + 2),
      fill: fills[i],
    });

    /* each function chip "thinks" for a slightly different beat */
    const DWELL = [0.3, 0.46, 0.38, 0.54];
    const CONN_T = 0.55;
    const VERT_T = 0.45;
    const HOLD_UNTIL = 3;
    const FADE_T = 1.2;
    const GAP = 2;

    /* One flow cycle. Strokes are drawn on the FIRST cycle only and then
       persist — later cycles just breathe the light and the fill. */
    const makeCycle = (drawStrokes: boolean) => {
      const c = gsap.timeline();
      for (let i = 0; i < 4; i++) {
        const b = branch(i);
        const arrive = CONN_T + DWELL[i] + VERT_T;
        c.fromTo(
          b.conn,
          { strokeDashoffset: SEG },
          { strokeDashoffset: -(len(b.conn) + SEG), duration: CONN_T, ease: "none" },
          0
        );
        c.fromTo(
          b.vert,
          { strokeDashoffset: SEG },
          { strokeDashoffset: -(len(b.vert) + SEG), duration: VERT_T, ease: "none" },
          CONN_T + DWELL[i]
        );
        if (drawStrokes) {
          b.strokes.forEach((p) =>
            c.fromTo(
              p,
              { strokeDashoffset: len(p) },
              { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
              arrive
            )
          );
        }
        c.fromTo(
          b.fill,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power1.inOut" },
          arrive + 0.12
        );
      }
      // hold lit, then only the FILL drains — strokes stay
      c.to(fills, { opacity: 0, duration: FADE_T, ease: "power1.inOut" }, HOLD_UNTIL);
      return c;
    };

    let master: gsap.core.Timeline | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        master = gsap.timeline();
        master.add(makeCycle(true));
        master.add(
          gsap.timeline({ repeat: -1, repeatDelay: GAP }).add(makeCycle(false)),
          `+=${GAP}`
        );
      },
      { threshold: 0.45 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      master?.kill();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 opacity-80 mix-blend-plus-lighter"
      style={mask("/features/f1-mask-inner.svg", "686px 489px", "-49px 4px")}
    >
      {/* function row (static, unchanged) */}
      <div className={CHIP} style={{ left: 235, top: 102, border: "0.9px solid #313131", padding: "6px 12px" }}>
        Prompt
      </div>
      {[
        { label: "Design", x: 76 },
        { label: "Plan", x: 180 },
        { label: "Data", x: 289 },
        { label: "Cloud", x: 394 },
      ].map(({ label, x }) => (
        <div key={label} className={CHIP} style={{ left: x, top: 206, width: 71, border: "0.9px solid #2A2A2A" }}>
          {label}
        </div>
      ))}

      {/* agent row: strokeless until the light arrives; fill overlay fades
          to Agent 2's active style */}
      {AGENTS.map(({ label, x }) => (
        <div key={label} className={`${CHIP} w-[71px]`} style={{ left: x, top: AGENT_Y }}>
          <div
            aria-hidden
            data-agent-fill
            className="absolute inset-0 rounded-sm opacity-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06)), linear-gradient(90deg, rgba(67,117,237,0.22), rgba(67,117,237,0.22))",
            }}
          />
          <span className="relative">{label}</span>
        </div>
      ))}

      {/* base connector artwork (unchanged static look) */}
      <BleedImg src="/features/f1-conn-2.svg" inset="-0.15% -0.31% -0.24% -0.29%" cls="absolute left-[112px] top-[135px] h-[70px] w-[142px]" />
      <BleedImg src="/features/f1-conn-3.svg" inset="-0.14% -0.84% 0 -0.86%" cls="absolute left-[214px] top-[135px] h-[70px] w-[52px]" />
      <BleedImg src="/features/f1-conn-4.svg" inset="-0.14% -0.84% 0 -0.86%" cls="absolute left-[274px] top-[135px] h-[70px] w-[52px] -scale-x-100" />
      <BleedImg src="/features/f1-conn-1.svg" inset="-0.15% -0.31% -0.24% -0.29%" cls="absolute left-[286px] top-[135px] h-[70px] w-[142px] -scale-x-100" />
      {[
        { x: 111, src: "/features/f1-line-a.svg" },
        { x: 213, src: "/features/f1-line-b.svg" },
        { x: 325, src: "/features/f1-line-c.svg" },
        { x: 428, src: "/features/f1-line-b.svg" },
      ].map(({ x, src }) => (
        <div key={x} className="absolute top-[239px] h-[59px] w-px" style={{ left: x }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="absolute inset-0 size-full max-w-none object-fill" />
        </div>
      ))}

      {/* animation overlay: travelling lights + closing agent strokes */}
      <svg
        className="pointer-events-none absolute inset-0"
        width="563"
        height="444"
        viewBox="0 0 563 444"
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="ad-agent-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4C8BE9" stopOpacity="0.7" />
            <stop offset="1" stopColor="#676767" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* the light IS the vector lighting up: hairline width, no extra
            glow layer, emerging from under the Prompt chip */}
        {CONNECTORS.map(({ key, d, transform }) => (
          <g key={key} transform={transform}>
            <path data-light="connector" d={d} stroke="#4C8BE9" strokeOpacity="0.85" strokeWidth="1.1" />
          </g>
        ))}

        {VERTICAL_X.map((x) => (
          <path key={x} data-light="vertical" d={`M ${x} 239 V 298`} stroke="#4C8BE9" strokeOpacity="0.85" strokeWidth="1.1" />
        ))}

        {AGENTS.map(({ label, x }, i) => (
          <g key={label}>
            <path
              data-agent-stroke
              d={halfOutline(x, AGENT_Y, -1)}
              stroke={i === 1 ? "#4C8BE9" : "url(#ad-agent-stroke)"}
              strokeOpacity={i === 1 ? 0.7 : 1}
              strokeWidth="0.9"
            />
            <path
              data-agent-stroke
              d={halfOutline(x, AGENT_Y, 1)}
              stroke={i === 1 ? "#4C8BE9" : "url(#ad-agent-stroke)"}
              strokeOpacity={i === 1 ? 0.7 : 1}
              strokeWidth="0.9"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function BleedImg({ src, inset, cls }: { src: string; inset: string; cls: string }) {
  return (
    <div className={cls}>
      <div className="absolute" style={{ inset }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="absolute inset-0 size-full max-w-none" />
      </div>
    </div>
  );
}
