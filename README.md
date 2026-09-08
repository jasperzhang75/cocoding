# cocoding.ai

The landing page for Cocoding, built from the Figma design
[cocoding.ai Designer DEV](https://www.figma.com/design/yFciEPejue3E2xhstXF0Wu/cocoding.ai-Designer-DEV).

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4,
GSAP and Motion. One static page, no backend, no environment variables.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm run start      # serve it
```

## Where things are

- `src/app/page.tsx` — the page: the sections in order
- `src/components/landing/` — one component per section, each headed by a
  comment with its Figma node and the decisions behind it
- `src/app/globals.css` — the theme (type scale, colors, radii) and the few
  global animations
- `public/` — the cut assets: the hero still, project and feature images,
  logos, testimonial photos

## Notes for whoever takes this on

- The hero background is a Unicorn Studio scene loaded from their CDN at
  runtime; the still in `public/hero` shows until its first frame.
- Placeholder content: the testimonial quotes, names and photos; the
  pricing copy, credits picker and Annual switch; the nav, footer and CTA
  links (`#`).
- The Infrastructure section is scroll-driven (a hold with wheel-stepped
  frames on pointer devices, plain scrolling on touch). Its latest Safari
  fixes have not been re-verified in Safari.
- Mobile: the Testimonial cards have no phone design yet; the
  Infrastructure's phone captions are pending.
- Deploy: Vercel with the defaults.
