# Independent verification — FAIL

**Candidate:** `3bc4d17c122f228ebf4746309622009de8cd6ff1`  
**Live URL:** <https://generative-palette-a11y.sociobot.in/>  
**Verified:** 2026-08-28 (UTC)  
**Result:** **FAIL — do not release**

## Release blockers

1. **BLOCKER — no claims contract.** `.factory/claims.json` is absent in the
   clean candidate. The work order makes a missing claims file, or a failing
   claim test, release-blocking. Consequently there were no declared claim
   tests that could be run through the product demo entry point.
2. **BLOCKER — first-read/demo gate fails.** Cold-read of the live first
   screen: it presents a local browser tool that tests a generative palette
   against its actual frame proportions; it implies makers of generative
   palettes rather than plainly naming generative-coding artists; and the
   first action is **“Start a palette study.”** There is no one-click action
   labelled or functioning as “try it with sample data” / demo. The initial
   palette is prefilled and there is a later **“Restore study”** control, but
   neither satisfies the explicit one-click sample-data-demo acceptance gate.
3. **HIGH — first offline reload is broken after the service worker installs.**
   In a fresh Chromium context, a successful online load registered
   `sw.js` and cache `palette-a11y-v1`, containing only `/` and
   `/notebook-hero.webp`. With the network then disabled, reload returned the
   cached HTML (200) but the uncached hashed JS request fell through to the
   service worker’s `caches.match('/')` fallback. Chromium reported: `Failed
   to load module script: Expected a JavaScript-or-Wasm module script but the
   server responded with a MIME type of "text/html".` The application does
   not run offline. The fixed `palette-a11y-v1` cache name and cache-first
   strategy also leave a future update susceptible to serving an old shell.

## Other defects

| Severity | Finding | Evidence |
| --- | --- | --- |
| Medium | Focus indicator does not meet the required 3:1 UI contrast. | `button:focus-visible,a:focus-visible,input:focus-visible` uses `#be8213`; against the paper `#f7f0df` its contrast is 2.89:1. It is visible (3px) but below the stated minimum. |
| Medium | Some touch targets are below the 44×44 px baseline. | `.remove` is 35×38 px; frame removal uses a small text button with no minimum target size. The 390px visual check confirms the compact controls. |
| Low | Missing defence-in-depth response policies. | Live `/`, `sw.js`, JS, and privacy responses lack `Content-Security-Policy` and `Permissions-Policy`. They do provide HSTS, `nosniff`, and a referrer policy. Hashed JS/CSS are only `cache-control: public, must-revalidate, max-age=30`, not immutable long-lived cache headers. |

## What passed

- Clean install and quality gates: `npm ci`; `npm test` — 5/5 Vitest tests
  passed; `npm run build` — passed and produced `dist/`. `npm run` exposes no
  separate lint or type-check command; production build runs `tsc -b`.
- Built bundles: JS 9.08 kB (4.09 kB gzip), CSS 7.08 kB (2.33 kB gzip), hero
  image 78 kB; comfortably within the static-product bundle budgets.
- Live deployment matches this candidate exactly: SHA-256 of local `dist`
  `index.html`, JS, CSS, hero, and `public/sw.js` matched their live responses.
- Playwright desktop and 390×844 mobile checks: no console/page errors during
  normal use, no horizontal overflow, one `h1`, one `main`, `lang=en`, title,
  and expected image alt text. `@axe-core/playwright` found **0 violations**
  on both local and live pages (including zero serious/critical findings).
- Keyboard smoke check reaches the skip link and native form controls; focus
  is visually present. The skip link moves to `#lab` (active element becomes
  `BODY`), rather than a focusable `main` target. Reduced motion changes scroll
  behavior to `auto`, removes hero rotation, and removes button transitions.
- End-to-end local workflow: default report rendered; add swatch worked;
  invalid hex set `aria-invalid=true` and a valid hex cleared it; unchecking
  all simulations gave its recovery message; a valid local PNG was analysed;
  8 MB rejection and six-frame limit messages worked; export downloaded
  `palette-a11y-field-notes.json`; selected frame removal worked.
- Privacy/network: cold live load requested only same-origin document, JS,
  CSS, and hero. No cookies, localStorage, or sessionStorage were created;
  source review found no analytics, upload endpoint, account/auth flow, or
  third-party runtime asset. This is a static product with no server-side API,
  so rate-limit and sign-in checks are not applicable.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run preview
```

Use Chromium/Playwright to load `http://127.0.0.1:4173/`, wait for service
worker readiness, set the browser offline, and reload to reproduce the module
MIME error. Re-test the deployed URL after fixes; it was byte-identical to the
candidate during this verification.

## Required before resubmission

1. Add `.factory/claims.json` and runnable demo-entry claim tests.
2. Put a plainly labelled one-click sample-data demo on the cold first screen,
   and name the target user in plain language.
3. Correct service-worker precaching/update versioning and prove an offline
   reload works after the initial online visit.
4. Bring focus and all control hit areas up to the specified accessibility
   minimums; then rerun keyboard/mobile/axe checks.
