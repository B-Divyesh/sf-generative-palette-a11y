# Handoff — Generative Palette A11y repair

## Release status

Repaired and deployed to
<https://generative-palette-a11y.sociobot.in>.

- **Implementation SHA:** `90136617237fc26ca8c051988500986ace601e02`
- **Verification documentation SHA:** `929291dd530ba64add7ba1d90b9b18338e83ef5d`
- **Implementation lineage:** `b8f78a8` repaired the reported product
  defects; `de68152` restored real 404 responses; `7f3802b` and `9013661`
  removed demo layout shift without hiding content.
- **Prior failed candidate:** `3bc4d17c122f228ebf4746309622009de8cd6ff1`

## What changed

- Added `.factory/claims.json` and six isolated, outcome-based browser claim
  tests.
- Added `/demo` and `?demo=1`. They load the Night transit loop sample with
  five swatches and two hand-authored frames in one action.
- Added a persistent demo label, reset, and exit controls. Demo edits use only
  `demo:generative-palette-a11y:study`; exiting deletes that key and opens the
  separate real starting study.
- Replaced interpolated user text in the renderer with DOM node construction.
  Swatch names can no longer create elements or run script.
- Generated a cache-versioned service worker after each build. It precaches
  the exact hashed JS/CSS shell, sample frames, legal pages, and hero; offline
  navigation falls back only to HTML, never to module requests.
- Made controls 44px or larger, added a two-tone high-contrast focus ring,
  fixed the skip target, and verified 195px effective-width reflow.
- Added Azure Static Web Apps CSP, Permissions-Policy, immutable cache headers
  for hashed assets and the hero, and `no-cache` for the service worker.
- Added shared legal-page navigation, route metadata, robots, sitemap,
  favicon/touch icon, social preview, and a designed HTTP 404 page.
- Rewrote the cold first screen in plain words. It names the job, audience,
  and first action before scrolling.

## Verification

From a clean dependency install:

```sh
npm ci
npm test                         # 5 passed
npm run build                    # produces dist/
npm run test:browser             # 13 passed
```

Every command listed in `.factory/claims.json` was run individually and
passed on the final code:

- demo sandbox
- sample analysis
- offline reload
- local processing
- JSON export
- six-frame / 8 MB boundary

Browser and accessibility evidence:

- Local Playwright + axe: 0 violations at desktop and 390px mobile.
- Browser regression checks cover invalid hex recovery, no selected
  simulation recovery, self-XSS input, touch-target size, 200% reflow, legal
  skeletons, and all claim outcomes.
- Live fresh desktop and phone contexts loaded `/demo` with title
  `Demo — Generative Palette A11y`, the persistent sample label, two frames,
  no horizontal overflow, and no console/page errors.
- Live offline reload succeeded after service-worker control: sample label and
  both frames remained available.
- The live skip link focused `#main`. Reduced motion yielded `scroll-behavior:
  auto`, no hero transform, and zero-duration button transitions.
- `verify-url.sh` passed live: title, `lang`, one `h1`, `main`, image alt
  text, and no console errors.
- Live unknown route returns the designed **HTTP 404** page. `/demo`,
  `/privacy/`, and `/terms/` return 200.
- Current live JS matches the final local build by SHA-256.

Live Lighthouse mobile run (2026-09-05, `/demo`):

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 92 | 817 ms | 1,209 ms | 0 |

Bundle measurements: JS 11,290 bytes (4,810 gzip), CSS 9,430 bytes
(2,810 gzip), hero 79,540 bytes. All are below the static-product budgets.

## Earlier findings and disposition

| Earlier finding | Disposition |
| --- | --- |
| Claims contract missing | Fixed with six declared claims and executable sandbox tests. |
| No one-click sample demo | Fixed with `/demo`, visible first-screen action, sample label, reset, and exit. |
| Offline module MIME error | Fixed with generated exact-shell precache and non-navigation cache matching. |
| 200% zoom overflow | Fixed and regression-tested at 195px effective width. |
| Low-contrast focus and small targets | Fixed: focus contrast is 10.03:1 against paper; controls are tested at ≥44px. |
| Short non-immutable asset caching | Fixed live: hashed JS/CSS and hero return one-year immutable caching; `sw.js` is `no-cache`. |
| Swatch-name self-XSS | Fixed with DOM APIs; browser test proves injected markup remains text. |
| Legal pages lacked shared structure | Fixed with header, nav, main, footer, skip link, and route titles. |
| Missing CSP / Permissions-Policy | Fixed live with matching response headers. |
| Skip link did not focus main | Fixed: live target is `#main`. |
| Broad fallback hid HTTP 404 | Fixed with explicit `/demo` rewrite and Azure 404 response override. |

## Known gaps and next steps

There are no known product defects from this repair pass. The product remains
free by research design, so there is no billing offer or external paid
integration to register. It has no backend, account system, API, tenant state,
or rate-limit surface; those checks are not applicable.
