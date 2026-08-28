# Handoff — Generative Palette A11y

## Delivered

- A local-first palette field lab: named hex swatches, common colour-vision
  simulation approximations, separation/luminance findings, bounded
  lightness-only alternatives, and JSON export.
- Up to six representative local image frames (PNG/JPEG/WebP/GIF, 8 MB each)
  are sampled in-browser and used to weight findings by approximate swatch area.
  No image, palette, or report is uploaded or persisted.
- First-class no-frame, bad/oversize-frame, offline, and no-simulation states;
  keyboard-operable native inputs/buttons; responsive 390px layout.
- Notebook visual system documented in `.factory/design.md`, including original
  factory-generated hero provenance. Optimised hero is 78 KB WebP.
- Privacy and terms pages, service-worker shell cache, README, MIT licence, and
  unit tests.

## Run and verify

```sh
npm install
npm test
npm run build
npm run preview
```

`npm test` passed: 5 colour conversion/simulation/metric tests.
`npm run build` passed and writes `dist/index.html` at the deployment root.
Production assets are 9.08 KB JS (4.09 KB gzip), 7.08 KB CSS (2.33 KB gzip),
and 78 KB WebP hero; initial JS is well below the 200 KB budget.

Browser verification with Playwright at 390×844 passed: one h1, one main,
correct title, no console errors, functional Add swatch and simulation controls,
no horizontal overflow. Axe scan reported **0 violations**.

## Lighthouse-class checks

Accessibility: axe 0 violations; title/lang/main/alt/focus/mobile checks pass.
Performance budget: 9.08 KB JS, 7.08 KB CSS, 78 KB hero; CLS-safe explicit
hero dimensions. A local Lighthouse CLI run was attempted with the preinstalled
Playwright Chromium but the browser tab crashed before it produced category
scores, so no Lighthouse numeric score is claimed here.

## Known limits / next steps

- The three simulations are stated sRGB matrix approximations, not a diagnosis,
  certification, or model of every person's vision.
- Frame weighting uses nearest supplied swatch; palettes with gradients or many
  colours should be sampled with representative frames and interpreted as a
  prompt to inspect.
- The service worker caches the shell after first successful load. Static-host
  cache headers can be added by deployment infrastructure if desired.
