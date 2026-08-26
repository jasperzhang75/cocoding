const colors = [
  { name: "Bg/Default", cls: "bg-bg", value: "#010101 ⚠ unbound", use: "Page background" },
  { name: "Text/Primary", cls: "bg-text-primary", value: "#EDEDED", use: "Headings, primary text" },
  { name: "Text/Body", cls: "bg-text-body", value: "#A1A1A1", use: "Body text" },
  { name: "Button/Primary", cls: "bg-button-primary", value: "#FFFFFF", use: "Primary button surface" },
  { name: "Accent", cls: "bg-accent", value: "#6A91FC ⚠ unbound", use: "'New' badge, highlights" },
];

const type = [
  { name: "Display", cls: "text-display", spec: "48 / 100 / -5%", sample: "What do you want to build?" },
  { name: "Heading/lg ⚠", cls: "text-heading-lg", spec: "36 / 100", sample: "Section heading large" },
  { name: "Heading/md ⚠", cls: "text-heading-md", spec: "24 / 100", sample: "Section heading medium" },
  { name: "Heading/sm ⚠", cls: "text-heading-sm", spec: "20 / 100", sample: "Section heading small" },
  { name: "Body/md ⚠", cls: "text-body-md", spec: "16 / 137.5", sample: "Create secure apps and websites that work from day one." },
  { name: "Body/sm", cls: "text-body-sm", spec: "14 / 137.5", sample: "Features · Pricing · Testimonial · Documents" },
  { name: "Body/xs", cls: "text-body-xs", spec: "13 / 137.5", sample: "Claude Opus 4.7 now available" },
  { name: "Indicator ⚠", cls: "text-indicator", spec: "13 / 137.5", sample: "New" },
];

const radii = [
  { name: "rounded-sm", cls: "rounded-sm", value: "6", use: "Buttons" },
  { name: "rounded-md", cls: "rounded-md", value: "8", use: "Small controls" },
  { name: "rounded-lg", cls: "rounded-lg", value: "10", use: "Cards" },
  { name: "rounded-xl", cls: "rounded-xl", value: "12", use: "Large cards" },
  { name: "rounded-2xl", cls: "rounded-2xl", value: "16", use: "Panels" },
  { name: "rounded-full", cls: "rounded-full", value: "99", use: "Pills" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-body-sm uppercase tracking-widest text-text-body">{title}</h2>
      {children}
    </section>
  );
}

export default function Tokens() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-10 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-display text-text-primary">Design tokens</h1>
        <p className="text-body-md text-text-body">
          Synced from Figma · group “Landing Page” · ⚠ = style exists in Figma but is unbound/unused; value is a sampled placeholder
        </p>
      </header>

      <Section title="Colors">
        <ul className="flex flex-col gap-3">
          {colors.map((c) => (
            <li key={c.name} className="flex items-center gap-4">
              <span className={`${c.cls} size-10 shrink-0 rounded-md border border-[#2e2e2e]`} />
              <span className="w-44 shrink-0 text-body-sm text-text-primary">{c.name}</span>
              <span className="w-44 shrink-0 text-body-xs text-text-body">{c.value}</span>
              <span className="text-body-xs text-text-body/60">{c.use}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typography">
        <ul className="flex flex-col gap-6">
          {type.map((t) => (
            <li key={t.name} className="flex flex-col gap-1.5">
              <span className="text-body-xs text-text-body">
                {t.name} — {t.spec}
              </span>
              <span className={`${t.cls} text-text-primary`}>{t.sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Radius">
        <ul className="flex flex-wrap gap-6">
          {radii.map((r) => (
            <li key={r.name} className="flex flex-col items-center gap-2">
              <span className={`${r.cls} size-20 border border-[#2e2e2e] bg-[#121212]`} />
              <span className="text-body-xs text-text-body">{r.name}</span>
              <span className="text-body-xs text-text-body/60">
                {r.value}px · {r.use}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <footer className="flex flex-col gap-1 border-t border-[#2e2e2e] pt-6">
        <p className="text-body-xs text-text-body/60">
          Spacing: no tokens — Tailwind 4px dynamic grid (22px = gap-5.5). One-off values use [13px] arbitrary syntax.
        </p>
        <p className="text-body-xs text-text-body/60">
          Breakpoints: base 375+ mobile · md 768 tablet · xl 1280 desktop.
        </p>
      </footer>
    </main>
  );
}
