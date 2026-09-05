# Independent repair verification — PASS

**Implementation:** `90136617237fc26ca8c051988500986ace601e02`  
**Live URL:** <https://generative-palette-a11y.sociobot.in>  
**Date:** 2026-09-05 UTC  
**Result:** **PASS**

## Scope

This verifies the repaired successor to failed candidate
`3bc4d17c122f228ebf4746309622009de8cd6ff1`. The researched job remains a
local palette checker for generative-coding artists. The first screen now says
what it does, who it serves, and offers **Try it with sample data**.

## Claims

`.factory/claims.json` lists six claims. After `npm ci`, every declared
command was run separately:

```sh
npm run test:browser -- --grep @claim:demo-sandbox
npm run test:browser -- --grep @claim:sample-analysis
npm run test:browser -- --grep @claim:offline-reload
npm run test:browser -- --grep @claim:local-processing
npm run test:browser -- --grep @claim:json-export
npm run test:browser -- --grep @claim:frame-limit
```

All passed. The tests use fresh browser contexts and `/demo`; they prove
sample isolation, populated output, offline reload, first-party-only requests,
JSON download, and the six-frame/8 MB boundary.

## Quality gates

| Check | Evidence |
| --- | --- |
| Clean install, unit tests, build | `npm ci`; `npm test` 5/5; `npm run build` passed with `dist/index.html`. |
| Browser suite | `npm run test:browser` passed 13/13. |
| Accessibility | Axe in Playwright reported 0 violations at desktop and 390px mobile. `verify-url.sh` passed live. |
| Manual keyboard and motion | Skip link focuses `#main`; reduced-motion browser reports `auto`, `none`, and `0s` for scroll, hero, and button motion. |
| Live desktop and phone | Fresh `/demo` contexts had two sample frames, persistent sample label, no overflow, and no console/page errors. |
| Offline | After service-worker control, an offline `/demo` reload retained the sample label and both frames. |
| Privacy | The local-processing claim logged only first-party requests. No account, analytics, upload API, or external runtime asset exists. |
| Headers and cache | Live CSP, Permissions-Policy, HSTS, nosniff, referrer policy. Hashed JS/CSS and hero are `max-age=31536000, immutable`; service worker is `no-cache`. |
| Routes | `/`, `/demo`, `/privacy/`, `/terms/` return 200. An unknown route returns HTTP 404 and the designed page. |
| Product identity | Current live JS SHA-256 matches the final local build. |
| Performance | Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 92, FCP 817 ms, LCP 1,209 ms, CLS 0. |

## Findings carried forward

None. The prior blockers and all recorded high, medium, and low findings are
resolved; the disposition table is in `.factory/handoff.md`.
