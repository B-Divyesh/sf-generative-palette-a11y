# Independent verification — FAIL

**Candidate:** `3bc4d17c122f228ebf4746309622009de8cd6ff1`
**Live URL:** <https://generative-palette-a11y.sociobot.in>
**Date:** 2026-08-28 UTC
**Verdict:** **FAIL — do not release.**

## Mandatory preflight

The candidate has no `.factory/claims.json`. This was checked before package
installation or product testing. Consequently there were no claim tests to run
through the demo entry point. Per the work order, a missing claims file is a
release-blocking finding.

Cold-reading the live page in a fresh browser produced: “Keep the mood. Make
the marks separate.”, an explanation that it tests a generative palette against
its frames, and the first primary action “Start a palette study.” It partly
explains the task, but does not plainly identify the intended
generative-coding-artist audience in the first screen, and, decisively, it
does **not** provide a one-click “try it with sample data” action. This fails
the required first-read/demo-sandbox acceptance criterion.

## Findings

### Blocker

1. **No claims contract or claim-test execution path.** `.factory/claims.json`
   is absent from the clean candidate. The explicitly mandated claim tests
   therefore cannot be run via the product demo entry point.
2. **No one-click sample-data demo.** The live and local first screens only
   offer “Start a palette study”; users must manually edit the preloaded
   palette and cannot invoke a named sample-data demonstration in one click.

### High

1. **Mobile 200% zoom/reflow is horizontally clipped.** At an effective 195
   CSS-pixel viewport (390px at 200% zoom), the document is 282px wide and a
   swatch row is 252px wide. This requires horizontal scrolling and violates
   the required 200% text-resize/reflow support.
2. **Focus and touch-target requirements are not met.** Keyboard focus is
   visible, but its `#be8213` outline has only 2.89:1 contrast against paper
   and 2.21:1 against the primary blue (minimum is 3:1). Remove buttons are
   35×38px, simulation labels 40px high, and suggested-fix buttons 36px high;
   all are below the required 44px touch target.
3. **The shipped service worker does not support offline reload.** After the
   worker was ready and the page had been reloaded under its control, cache
   storage contained only `/` and `/notebook-hero.webp`. On offline reload the
   cached HTML loaded, but the module-script request received the HTML fallback
   and failed strict MIME checking; the report did not render and the offline
   notice did not run. This contradicts the handoff’s shell-cache claim.

### Medium

1. **Hashed static assets are not immutable-cached in production.** The live
   JS, CSS, hero image, and service worker all return `Cache-Control: public,
   must-revalidate, max-age=30`, rather than a long-lived immutable policy for
   hashed assets. This misses the static performance/cache contract.
2. **A swatch name can inject executable HTML (self-XSS).** Swatch names are
   HTML-escaped in some locations but interpolated unescaped in the colour
   label’s `aria-label`. A local test name containing an injected `<img
   onerror>` created a second image and emitted the test JavaScript marker
   after “Add swatch.” There is no persistence or sharing path, so this is
   presently self-XSS, but it is still unsafe DOM handling. The absence of a
   `Content-Security-Policy` response header provides no containment.

### Low

1. `/privacy/` and `/terms/` have valid `lang`, title, one `h1`, and `main`,
   but omit the site header/nav/footer landmarks and shared navigation. The
   main application page has all of them.
2. Production response headers include HSTS, `Referrer-Policy`, and
   `X-Content-Type-Options`, but no CSP or Permissions-Policy.

## Checks completed

| Area | Result / evidence |
| --- | --- |
| Clean install and unit tests | `npm ci` succeeded; `npm test` passed: 5/5 Vitest tests. |
| Type/build | `npm run build` passed (`tsc -b && vite build`) and produced `dist/`. No lint script exists. |
| Deployment identity | SHA-256 matched local `dist` and live files for `index.html`, JS, CSS, hero WebP, `sw.js`, privacy, and terms. The deployment is this candidate. |
| Main product flow | Passed normal palette analysis, add swatch, invalid hex (`aria-invalid`) and valid recovery, no-simulation recovery, valid PNG frame, invalid-image recovery, >8MB rejection, six-frame cap, JSON export, and applying a suggested adjustment by Enter/Space. |
| Keyboard | Main flow tabbed in sensible order with a skip link; controls worked with keyboard; no trap observed. Focus contrast/target-size defects above remain. |
| Browser errors | No console or page errors during normal desktop/mobile/live load or ordinary product flow. The only console failure was the intentionally tested offline reload. |
| Accessibility scan | Playwright axe (`@axe-core/playwright`) found 0 violations at local desktop and 390×844 mobile; this does not detect the manually measured focus/reflow/target issues. |
| Structure/mobile | Main app: title, `lang=en`, exactly one `h1`, one `main`, header/nav/footer, no 390px horizontal overflow. Privacy/terms as noted above. |
| Reduced motion | Passed: `scroll-behavior: auto`, hero transform `none`, and button transition `0s` under `prefers-reduced-motion: reduce`. |
| Privacy/outbound traffic | Fresh live load made only four first-party GETs (document, JS, CSS, hero). Source review found no analytics, upload API, cookies, user palette/frame persistence, external fonts, or third-party runtime resources. Images/frames are processed with browser object URLs/canvas. |
| APIs/auth/rate limit | Not applicable: this is a static site with no server-side product endpoints, account flow, or product-unlock call. |
| Response headers | HTTPS 200 responses had HSTS, strict-origin-when-cross-origin, and nosniff. See cache and CSP findings. |
| Budget | Pass: JS 9,075 bytes (4,090 gzip), CSS 7,084 (2,330 gzip), hero 79,540 bytes; all below supplied static budgets. |
| Lighthouse | Numeric run unavailable: Lighthouse 12.6.0 could not connect to the supplied Chromium, then crashed its browser tab even with headless/no-sandbox flags. No score is claimed. Direct browser/axe/performance-budget checks above completed. |

## Reproduction commands

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

Run the browser checks against `http://127.0.0.1:4173/`. The offline failure
reproduces by waiting for `navigator.serviceWorker.ready`, reloading once to
obtain a controller, switching the browser context offline, and reloading.

## Release recommendation

**FAIL.** Add a claims file and executable demo-entry claim tests, add a
one-click named sample workflow, repair mobile reflow/focus/target sizes, and
either make the service-worker offline path work or remove its offline claim.
Set immutable cache headers for hashed assets and fix the DOM injection before
resubmission.
