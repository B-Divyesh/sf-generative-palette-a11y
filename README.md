# Generative Palette A11y

Generative Palette A11y is a browser-based field lab for generative-coding artists. Add a palette and a handful of representative sketch frames; the tool simulates several common colour-vision differences, estimates which palette pairs can merge, and offers bounded lightness alternatives without changing the hue relationship wholesale.

It is intentionally local-first: images are decoded and sampled in your browser, and the app has no account, upload endpoint, analytics, or persistence.

Live: https://generative-palette-a11y.sociobot.in

## Develop

```
npm install
npm run dev
npm test
npm run build   # -> dist/
```

## How to use it

1. Rename or edit the supplied swatches (at least two are required).
2. Optionally add up to six PNG, JPEG, WebP, or GIF frames under 8 MB each.
3. Review the selected simulated conditions and inspect the flagged pairs.
4. Apply a bounded alternative when useful, then export the field notes JSON for your sketch.

The colour simulations are sRGB matrix approximations, and frame weighting maps each sampled pixel to the nearest supplied swatch. They are prompts for inspection, not accessibility certification.

## Deployment

Run `npm run build` and deploy the generated `dist/` directory as a static site. `index.html` is at the dist root. No runtime services or environment variables are required.

## Privacy and licence

See [Privacy](/privacy/) and [Terms](/terms/). Released under the [MIT License](LICENSE).
