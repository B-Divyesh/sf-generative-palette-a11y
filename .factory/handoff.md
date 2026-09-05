# Handoff — Generative Palette A11y verification 2

## Release status

**FAIL — independent QA found 3 findings and 7 untested public claims.**

- **Implementation reviewed:** `90136617237fc26ca8c051988500986ace601e02`
- **Documentation base reviewed:** `df5815e521306a28ea3053e96e6ffc85feac8b5b`
- **Live URL:** <https://generative-palette-a11y.sociobot.in>
- **Prior failed candidate:** `3bc4d17c122f228ebf4746309622009de8cd6ff1`
- **Full report:** `.factory/verification-2.md`

The live product matches the implementation candidate. Later commits before
this verification changed reports only. No product code was modified during
this pass.

## Findings to resolve

1. Four core analysis promises lack claim entries and tagged tests: nearest
   color matching, the 52 / 255 threshold, the three named sRGB simulations,
   and applying a bounded lightness alternative.
2. The local-processing test does not select a user frame or export notes, so
   the two associated no-upload promises are not exercised.
3. PNG, JPEG, WebP, and GIF support is advertised, but the claim contract does
   not list the format promise and the frame test uses PNG only.

These are claims-contract findings. Independent live checks found that the
bounded alternative, all four formats, and local-only file/export behavior do
work. They still require declared, repeatable claim coverage before PASS.

## Verification completed

From a fresh GitHub checkout:

```sh
npm ci
npm test                         # 5 passed
npm run build                    # dist/ produced
npm run test:browser             # 13 passed
```

All six commands currently listed in `.factory/claims.json` were also run
separately and passed one test each. See the report for why two tests are
incomplete and other public claims are unlisted.

Live evidence completed:

- fresh 1440×900 desktop and 390×844 phone first screens;
- one-click sample, populated report, persistent demo notice, reset, and exit
  to an unchanged real starter study;
- keyboard, focus, 44 px targets, 195 px reflow, reduced motion, and axe;
- invalid hex, no-simulation, corrupt-image, self-XSS, size/count boundaries,
  format loading, suggestion, export, and recovery paths;
- privacy request log, no cookies, offline reload, service-worker cache;
- route titles, shared legal structure, link crawl, and designed HTTP 404;
- security/cache headers and byte comparison with the local build;
- factory `verify-url.sh` and mobile Lighthouse.

Live Lighthouse on `/demo`: performance 100, accessibility 100, best practices
100, SEO 92, FCP 915 ms, LCP 1,230 ms, CLS 0, TBT 39.5 ms. JavaScript is
11,288 bytes, CSS is 9,427 bytes, and the hero is 79,540 bytes.

## Earlier repair disposition

The one-click demo, offline module loading, mobile reflow, focus contrast,
44 px targets, immutable asset caching, safe swatch rendering, shared legal
pages, CSP, Permissions-Policy, skip-link focus, and real HTTP 404 behavior all
remain resolved. The prior missing-claims finding is only partly resolved
because the current inventory and tests do not cover every public promise.

## Next step

Add or expand claim entries and tagged tests for the seven untested promises,
run every claim command independently from a clean checkout, and request a new
verification. No backend, tenant, database, health endpoint, or 429 surface
exists for this static product.
