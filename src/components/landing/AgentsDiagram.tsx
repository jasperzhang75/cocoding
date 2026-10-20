"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { setLoopPlayState } from "@/lib/use-in-view";

/* The agents-card diagram (chips, connectors, verticals) plus its scroll-in
   animation. Vector geometry extracted from Figma via vectorPaths, in PANEL
   coordinates (563x444); the two right-hand connectors are mirrored in the
   design, reproduced with scale(-1,1) groups.

   Sequence, per Jasper's spec — a slow, subtle LOOP started on scroll into
   view. At rest every chip is a borderless #181C1F 65% pill (the redesign
   file's default since 2026-10-20 — before that the function chips had a
   #2A2A2A / #313131 edge and the agents a permanent blue-top/gray-bottom
   gradient stroke); the blue fill and the blue stroke belong to the
   animation only. The soft ellipse mask that clipped the whole diagram
   (Figma's Ellipse 124, f1-mask-inner.svg) is off in the design since
   2026-10-20 and gone here. Each cycle:
   0. (2026-10-20, Jasper: "prompt 这个方块从左到右由快到慢加载完这个蓝色
      filling 然后再向下流出这个光线") the Prompt chip fills from the LEFT
      — its #4375ED 34% + white 6% fill and its #4C8BE9 70% stroke sweep
      in over PROMPT_T with an ease-out, fast then slow, the end state the
      redesign file draws (bHyNfFfV0ocgVPCHtOyYBp 1063:507) — and the
      lights leave as the sweep lands (LIGHTS_AT); the Prompt drains with
      the agents' blue at the end of the cycle,
   1. a #4C8BE9/85 light flows from under the Prompt chip down all four
      connectors,
   2. it dwells briefly at each function chip — every branch a slightly
      different beat, as if thinking — then continues down the verticals,
   3. as it arrives, a solid-blue stroke closes down over the gray from the
      top and the chip fades in Agent 2's blue fill,
   4. everything holds, then fill AND blue stroke drain away together,
      returning the chips to the resting gradient; after a quiet gap the
      cycle replays.
   prefers-reduced-motion shows the resting state, no loop. */


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

/* the agents' boxes: 2-4 hug their wider label at 75 in the design */
const AGENTS = [
  { label: "Agent 1", x: 76, w: 71 },
  { label: "Agent 2", x: 177, w: 75 },
  { label: "Agent 3", x: 288, w: 75 },
  { label: "Agent 4", x: 394, w: 75 },
];
const AGENT_Y = 299;
const AGENT_H = 32;
const R = 6;
/* the Prompt chip's box (its 0.9 border inside), for the fill overlay and
   the blue stroke that sweep across it */
const PROMPT = { x: 235, y: 102, w: 73, h: 32 };

/* a chip at rest: the design's #181C1F 65% pill, no edge */
const CHIP =
  "absolute flex h-8 items-center justify-center rounded-sm bg-[rgba(24,28,31,0.65)] text-label-sm text-text-primary";

export default function AgentsDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lights = [...root.querySelectorAll<SVGPathElement>("[data-light]")];
    const blues = [...root.querySelectorAll<SVGRectElement>("[data-agent-blue]")];
    const clips = [...root.querySelectorAll<SVGRectElement>("[data-agent-clip]")];
    const fills = [...root.querySelectorAll<HTMLElement>("[data-agent-fill]")];
    const promptFill = root.querySelector<HTMLElement>("[data-prompt-fill]");
    const promptBlue = root.querySelector<SVGRectElement>("[data-prompt-blue]");
    const promptClip = root.querySelector<SVGRectElement>("[data-prompt-clip]");
    if (!promptFill || !promptBlue || !promptClip) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // resting state: default gradient strokes only — the travelling
      // lights and the Prompt's fill hidden too
      gsap.set(lights, { opacity: 0 });
      gsap.set(blues, { opacity: 0 });
      gsap.set(fills, { opacity: 0 });
      gsap.set([promptFill, promptBlue], { opacity: 0 });
      return;
    }

    const SEG = 30;
    const len = (p: SVGPathElement) => p.getTotalLength();
    lights.forEach((p) => {
      p.style.strokeDasharray = `${SEG} ${len(p) + SEG}`;
      p.style.strokeDashoffset = `${SEG}`;
    });
    gsap.set(fills, { opacity: 0 });

    /* DOM order: lights = 4 connectors then 4 verticals (one hairline path
       each); strokes = per agent (left, right); one fill per agent. Branch i
       feeds agent i. */
    const branch = (i: number) => ({
      conn: lights[i],
      vert: lights[4 + i],
      blue: blues[i],
      clip: clips[i],
      fill: fills[i],
    });

    /* each function chip "thinks" for a slightly different beat */
    const DWELL = [0.3, 0.46, 0.38, 0.54];
    const CONN_T = 0.55;
    const VERT_T = 0.45;
    const HOLD_UNTIL = 3;
    const FADE_T = 1.2;
    const GAP = 3;
    /* the Prompt's sweep: PROMPT_T long, fast then slow; the lights leave
       at LIGHTS_AT, as it lands — every later beat sits that much later */
    const PROMPT_T = 0.6;
    const LIGHTS_AT = 0.45;

    /* One flow cycle — identical every repeat. */
    const makeCycle = () => {
      const c = gsap.timeline();
      // 0. the Prompt fills from the left: the fill's clip and the blue
      //    stroke's clip rect open left to right together
      c.set([promptFill, promptBlue], { opacity: 1 }, 0);
      c.fromTo(
        promptFill,
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: PROMPT_T, ease: "power3.out" },
        0
      );
      c.fromTo(
        promptClip,
        { attr: { width: 0 } },
        { attr: { width: PROMPT.w + 4 }, duration: PROMPT_T, ease: "power3.out" },
        0
      );
      for (let i = 0; i < 4; i++) {
        const b = branch(i);
        const arrive = LIGHTS_AT + CONN_T + DWELL[i] + VERT_T;
        c.fromTo(
          b.conn,
          { strokeDashoffset: SEG },
          { strokeDashoffset: -(len(b.conn) + SEG), duration: CONN_T, ease: "none" },
          LIGHTS_AT
        );
        c.fromTo(
          b.vert,
          { strokeDashoffset: SEG },
          { strokeDashoffset: -(len(b.vert) + SEG), duration: VERT_T, ease: "none" },
          LIGHTS_AT + CONN_T + DWELL[i]
        );
        // the waterline: the clip rect descends, blue washing down over
        // the gray from where the gradient turns
        c.set(b.blue, { opacity: 1 }, arrive);
        c.fromTo(
          b.clip,
          { attr: { height: 0 } },
          { attr: { height: AGENT_H + 4 }, duration: 0.55, ease: "power1.inOut" },
          arrive
        );
        // the fill BURSTS full, then slowly dissipates on its own
        c.fromTo(
          b.fill,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: "power4.out" },
          arrive
        );
        c.to(
          b.fill,
          { opacity: 0, duration: 2.2, ease: "power1.out" },
          arrive + 0.75
        );
      }
      // fills dissipate on their own above; only the blue stroke holds,
      // then drains back to the resting gradient — the Prompt with it
      c.to([...blues, promptFill, promptBlue], { opacity: 0, duration: FADE_T, ease: "power1.inOut" }, LIGHTS_AT + HOLD_UNTIL);
      return c;
    };

    // Start the loop the first time it scrolls into view, then pause it
    // whenever it leaves and resume on return — this timeline drives the
    // heaviest paint on the page (blur + plus-lighter blend), so idling it
    // off-screen is the biggest battery win.
    let master: gsap.core.Timeline | undefined;
    // the CSS building-mark shimmer lives on the same card; pause it with us
    const card = root.closest<HTMLElement>("[data-agents-card]");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!master) {
            master = gsap.timeline({ repeat: -1, repeatDelay: GAP });
            master.add(makeCycle());
          } else {
            master.resume();
          }
          setLoopPlayState(card, true);
        } else {
          master?.pause();
          setLoopPlayState(card, false);
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      master?.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0 opacity-80 mix-blend-plus-lighter">
      {/* function row (static, unchanged) — except the Prompt, whose fill
          overlay sweeps in from the left each cycle (its blue stroke is in
          the SVG below) */}
      <div className={CHIP} style={{ left: PROMPT.x, top: PROMPT.y, width: PROMPT.w, padding: "6px 12px" }}>
        <div
          aria-hidden
          data-prompt-fill
          className="absolute inset-0 rounded-sm opacity-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06)), linear-gradient(90deg, rgba(67,117,237,0.34), rgba(67,117,237,0.34))",
            clipPath: "inset(0% 100% 0% 0%)",
          }}
        />
        <span className="relative">Prompt</span>
      </div>
      {[
        { label: "Design", x: 76 },
        { label: "Plan", x: 180 },
        { label: "Data", x: 289 },
        { label: "Cloud", x: 394 },
      ].map(({ label, x }) => (
        <div key={label} className={CHIP} style={{ left: x, top: 206, width: 71 }}>
          {label}
        </div>
      ))}

      {/* agent row: edgeless until the light arrives; fill overlay fades
          to Agent 2's active style */}
      {AGENTS.map(({ label, x, w }) => (
        <div key={label} className={CHIP} style={{ left: x, top: AGENT_Y, width: w }}>
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
      {/* the resting verticals: white 17% hairlines, 239 -> 298. They were
          <img>s of Figma's exports — 59 x 0.9 SVGs stretched into a 1 x 59
          box — which Safari does not paint (an intrinsic height under 1px
          rounds to nothing there); a background does the same job. */}
      {VERTICAL_X.map((x) => (
        <div key={x} className="absolute top-[239px] h-[59px] w-px bg-white/[0.17]" style={{ left: x }} />
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
        {/* the light IS the vector lighting up: hairline width, no extra
            glow layer, emerging from under the Prompt chip. Dashed to
            nothing in the markup (0 on, 1 off) so the server HTML and the
            page before hydration never show the paths lit end to end —
            they did until 2026-10-20, a flash on every load and a stuck
            state when a tab's hot reload lost the effect; the effect sets
            the real dash. */}
        {CONNECTORS.map(({ key, d, transform }) => (
          <g key={key} transform={transform}>
            <path data-light="connector" d={d} stroke="#4C8BE9" strokeOpacity="0.85" strokeWidth="1.1" style={{ strokeDasharray: "0 1" }} />
          </g>
        ))}

        {VERTICAL_X.map((x) => (
          <path key={x} data-light="vertical" d={`M ${x} 239 V 298`} stroke="#4C8BE9" strokeOpacity="0.85" strokeWidth="1.1" style={{ strokeDasharray: "0 1" }} />
        ))}

        {/* per agent: no stroke at rest. The solid-blue outline is revealed
            by a clip rect descending from the top — a waterline moving down
            over the whole box at once — then drains away with the hold
            fade. */}
        {AGENTS.map(({ label, x, w }, i) => (
          <g key={label}>
            <clipPath id={`ad-blue-clip-${i}`}>
              <rect data-agent-clip x={x - 2} y={AGENT_Y - 2} width={w + 4} height="0" />
            </clipPath>
            <rect
              data-agent-blue
              x={x}
              y={AGENT_Y}
              width={w}
              height={AGENT_H}
              rx={R}
              fill="none"
              stroke="#4C8BE9"
              strokeOpacity="0.7"
              strokeWidth="0.9"
              clipPath={`url(#ad-blue-clip-${i})`}
            />
          </g>
        ))}

        {/* the Prompt's blue stroke, revealed left to right by its clip rect */}
        <clipPath id="ad-prompt-clip">
          <rect data-prompt-clip x={PROMPT.x - 2} y={PROMPT.y - 2} width="0" height={PROMPT.h + 4} />
        </clipPath>
        <rect
          data-prompt-blue
          x={PROMPT.x}
          y={PROMPT.y}
          width={PROMPT.w}
          height={PROMPT.h}
          rx={R}
          fill="none"
          stroke="#4C8BE9"
          strokeOpacity="0.7"
          strokeWidth="0.9"
          clipPath="url(#ad-prompt-clip)"
        />
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
