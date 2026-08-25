const colors = [
  { name: "bg", cls: "bg-bg", value: "#010101", use: "页面底色" },
  { name: "surface", cls: "bg-surface", value: "#121212", use: "输入框 / 卡片" },
  { name: "fg", cls: "bg-fg", value: "#ededed", use: "主标题" },
  { name: "fg-secondary", cls: "bg-fg-secondary", value: "#dedcdc", use: "导航 / 按钮 / logo" },
  { name: "fg-muted", cls: "bg-fg-muted", value: "#a1a1a1", use: "工具栏文字" },
  { name: "fg-subtle", cls: "bg-fg-subtle", value: "161 161 161 / .6", use: "副标题 / 箭头" },
  { name: "fg-placeholder", cls: "bg-fg-placeholder", value: "146 146 146 / .5", use: "输入框占位符" },
  { name: "fg-inverse", cls: "bg-fg-inverse", value: "#0a0a0a", use: "白底按钮上的字" },
  { name: "accent", cls: "bg-accent", value: "#6a91fc", use: "New 标签" },
  { name: "accent-fg", cls: "bg-accent-fg", value: "#131516", use: "accent 上的字" },
  { name: "border", cls: "bg-border", value: "#2e2e2e", use: "Log in 描边" },
  { name: "border-subtle", cls: "bg-border-subtle", value: "63 63 63 / .32", use: "公告胶囊描边" },
];

const type = [
  { name: "text-hero", cls: "text-hero", spec: "48px · 1 · -0.05em", sample: "What do you want to build?" },
  { name: "text-body", cls: "text-body", spec: "16px · 1 · -0.01em", sample: "Create secure apps and websites." },
  { name: "text-ui", cls: "text-ui", spec: "14px · 1.375", sample: "Features · Pricing · Log in" },
  { name: "text-label", cls: "text-label", spec: "13px · 1.5", sample: "Gemini 3.0" },
  { name: "text-micro", cls: "text-micro", spec: "12px · 1.1667", sample: "New" },
];

const radii = [
  { name: "rounded-btn", cls: "rounded-btn", value: "6px" },
  { name: "rounded-control", cls: "rounded-control", value: "8px" },
  { name: "rounded-panel", cls: "rounded-panel", value: "16px" },
  { name: "rounded-pill", cls: "rounded-pill", value: "99px" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-ui uppercase tracking-widest text-fg-muted">{title}</h2>
      {children}
    </section>
  );
}

export default function Tokens() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-10 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-hero text-fg">Design tokens</h1>
        <p className="text-body text-fg-subtle">
          Extracted from Figma · cocoding.ai landing page
        </p>
      </header>

      <Section title="Colors">
        <ul className="flex flex-col gap-3">
          {colors.map((c) => (
            <li key={c.name} className="flex items-center gap-4">
              <span
                className={`${c.cls} size-10 shrink-0 rounded-control border border-border`}
              />
              <span className="w-40 shrink-0 text-ui text-fg-secondary">{c.name}</span>
              <span className="w-44 shrink-0 text-label text-fg-muted">{c.value}</span>
              <span className="text-label text-fg-subtle">{c.use}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typography">
        <ul className="flex flex-col gap-6">
          {type.map((t) => (
            <li key={t.name} className="flex flex-col gap-1.5">
              <span className="text-label text-fg-muted">
                {t.name} — {t.spec}
              </span>
              <span className={`${t.cls} text-fg`}>{t.sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Radii">
        <ul className="flex flex-wrap gap-6">
          {radii.map((r) => (
            <li key={r.name} className="flex flex-col items-center gap-2">
              <span
                className={`${r.cls} size-20 border border-border bg-surface`}
              />
              <span className="text-label text-fg-muted">{r.name}</span>
              <span className="text-micro text-fg-subtle">{r.value}</span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
