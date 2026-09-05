# Verify palette checks in sketch frames — FAIL

**Verdict:** **FAIL**

**Findings:** 3 (2 high, 1 medium)

**Untested public claims:** 7

**Implementation reviewed:** `90136617237fc26ca8c051988500986ace601e02`

**Documentation base reviewed:** `df5815e521306a28ea3053e96e6ffc85feac8b5b`

**Live URL:** <https://generative-palette-a11y.sociobot.in>

**Verified:** 2026-09-05 UTC

The two commits after `9013661` change only `.factory` reports. The live HTML,
JavaScript, CSS, service worker, hero, legal pages, and 404 page match the
fresh build byte for byte.

## First screen before scrolling

- **Job:** Check generative palettes in real sketch frames.
- **Audience:** Generative-coding artists who need more viewers to tell colors
  apart in moving sketches.
- **First action:** **Try it with sample data.** The adjacent text says it loads
  a palette and two sketch frames.
- The action ends at 611 px in a 900 px desktop viewport and 626 px in an
  844 px phone viewport. Both are visible before scrolling.

The language is direct and names the job. The first screen also states the
offline, local-frame, free, and no-account facts.

## Findings

### High — core analysis promises are absent from the claims contract

The public product explains four observable parts of the analysis that have no
claim entry and no tagged claim test:

1. pixels are matched to the nearest supplied color;
2. separation below 52 / 255 is flagged;
3. sRGB matrix approximations model protanopia, deuteranopia, and tritanopia;
4. a bounded lightness alternative can be applied.

`@claim:sample-analysis` checks only that the sample has two frames, an analysis
summary, and at least one finding. It does not assert the named matrices, the
numeric threshold, frame weighting, or the proposed change. This is especially
important because these calculations are the product's main job. The existing
unit tests cover parsing, normal vision, black/white contrast, and identical
colors, but not these four promises.

The live bounded-alternative control did work when checked independently: Enter
on **Use #E0A097** changed the second sample swatch from `#C95B4C` to
`#E0A097`. That manual result does not replace the required claim entry and
tagged sandbox test.

### High — the local-processing claim test does not exercise private inputs

The site promises that user frames stay on the device and that exported notes
are never received by the product. `@claim:local-processing` records requests
while it loads `/demo` and adds a swatch, but it never selects a local frame or
exports a file. `@claim:json-export` inspects the downloaded JSON but does not
record requests. The two privacy outcomes are therefore not proven by a claim
test.

Independent live inspection found no runtime leak: uploading PNG, JPEG, WebP,
and GIF files produced only same-origin and `blob:` requests; exporting JSON
added no external request; no cookies were set. The implementation appears
local, but the mandatory automated privacy evidence is incomplete.

### Medium — the four advertised frame formats are unlisted and incompletely tested

The UI and README say the product accepts PNG, JPEG, WebP, and GIF frames.
`.factory/claims.json` does not list that format-support promise. The
`@claim:frame-limit` test uploads only PNG data, so the four-format statement is
not covered by any declared claim command.

All four formats loaded in an independent live check, bringing the supplied two
frames to the six-frame limit. This is a claims-coverage defect, not an observed
runtime format failure.

## Declared claim commands

From a fresh GitHub checkout at `df5815e`, after `npm ci`, every command in
`.factory/claims.json` ran separately:

| Claim | Command result | Coverage result |
| --- | --- | --- |
| `demo-sandbox` | 1 passed | Complete for demo edit, exit, namespace, and unchanged real starter state. |
| `sample-analysis` | 1 passed | Incomplete for the four analysis promises in the first finding. |
| `offline-reload` | 1 passed | Complete for a controlled `/demo` offline reload. |
| `local-processing` | 1 passed | Incomplete for local frame selection and export traffic. |
| `json-export` | 1 passed | Complete for file name and sample JSON content; it does not cover the separate no-upload promise. |
| `frame-limit` | 1 passed | Complete for six frames and over-8-MB recovery; incomplete for the advertised JPEG, WebP, and GIF support. |

No declared command failed. The verdict is still FAIL because passing a partial
test does not make an omitted or incompletely tested public claim complete.

## Live product evidence

| Area | Result |
| --- | --- |
| One-click sample | `/demo` opened with the persistent **Sample: Night transit loop** label, five swatches, two frames, two findings, and **Weighted across 2 frames**. |
| Demo isolation | Only `localStorage["demo:generative-palette-a11y:study"]` appeared. Reset restored **Night platform** and two frames. **Start for real** removed the key and opened the untouched **Night ink** starter study. |
| Persistent notice | At the bottom of the page the sticky notice remained at viewport top with **Demo — sample data, nothing is saved**, **Reset demo**, and **Start for real**. |
| Normal and recovery paths | Populated analysis, suggestion by Enter, corrupt-image recovery, invalid hex with `aria-invalid=true`, no-simulation recovery, safe self-XSS rendering, six-frame limit, over-8-MB rejection, and JSON export worked. |
| Desktop and phone | Fresh 1440×900 and 390×844 contexts had no horizontal overflow or console/page errors. The primary action was above the fold in both. |
| 200% reflow | A 195 px effective viewport had `scrollWidth = clientWidth = 195`. |
| Touch and focus | Visible interactive targets, including the 44 px color-label hit areas, met the 44 px baseline. The first Tab reached the skip link; Enter focused `main`. The focus treatment used a 3 px light outline plus a 6 px dark ring. |
| Reduced motion | `scroll-behavior: auto`, no hero transform, and `0s` button transition. |
| Accessibility | Playwright axe found zero violations on live desktop, phone, home, demo, legal, and 404 pages. The factory `verify-url.sh` passed. |
| Privacy | No cookies, analytics, external runtime requests, or third-party fonts were observed. Local file checks used same-origin and `blob:` URLs only. |
| Offline/update | After service-worker control, an offline `/demo` reload retained the title, two frames, findings, and offline notice with no console errors. The content-named cache was `palette-a11y-c0414ff8efa9`. |
| Routes | `/`, `/demo`, `/privacy/`, and `/terms/` returned 200 with route-specific titles and shared landmarks. An unknown route returned the designed page with HTTP 404. That deliberate navigation 404 is not a defect. |
| Links | Every internal link crawled from the tested pages returned 200. |
| Headers/cache | CSP, Permissions-Policy, HSTS, nosniff, and referrer policy were live. Hashed JS/CSS and the hero used one-year immutable caching; `sw.js` used `no-cache`. |
| Backend checks | Not applicable. This is a static local browser product with no tenant, database, health API, or rate-limited backend. |

Screenshots and machine output are in `/work/.evidence/`, including desktop and
phone first screens, full demo pages, `verify-url/`, and `lighthouse.json`.

## Quality and performance

```text
npm ci                 passed
npm test               5 passed
npm run build          passed; dist/index.html produced
npm run test:browser   13 passed
six claim commands     1 passed each
```

The clean build contains 11,288 bytes of JavaScript (4.81 kB gzip), 9,427
bytes of CSS (2.81 kB gzip), and a 79,540-byte hero image.

Live mobile Lighthouse on `/demo`:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 92 | 915 ms | 1,230 ms | 0 | 39.5 ms |

## Earlier findings and current disposition

| Earlier finding | Current disposition |
| --- | --- |
| Claims contract missing | Partly resolved: six entries and commands exist, but the three findings above show seven public claims remain untested. |
| No one-click sample demo | Resolved live. |
| Offline module MIME failure | Resolved live and in the isolated claim command. |
| 200% zoom overflow | Resolved live. |
| Low-contrast focus | Resolved live. |
| Targets below 44 px | Resolved live. |
| Short caching for static assets | Resolved live for hashed JS/CSS and the hero. |
| Swatch-name self-XSS | Resolved; injected markup remained text and created no element. |
| Legal pages lacked shared structure | Resolved on Privacy and Terms. |
| Missing CSP and Permissions-Policy | Resolved live. |
| Skip link did not focus main | Resolved live. |
| Broad fallback hid real 404s | Resolved; unknown routes return the designed page with HTTP 404. |

## Required before PASS

Add or expand tagged claim tests so they directly assert all seven public
promises identified above. Run every resulting command separately from a clean
checkout, then repeat independent verification. Product-code repair was outside
this verification work order, so this pass changes reports only.
