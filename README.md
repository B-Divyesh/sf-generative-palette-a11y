# Generative Palette A11y

Generative Palette A11y checks colors in generative sketch frames. It is for
generative-coding artists who want more viewers to tell important marks apart.

Try the complete sample at
[generative-palette-a11y.sociobot.in/demo](https://generative-palette-a11y.sociobot.in/demo).
It loads the Night transit loop palette and two representative frames in one
click.

## Use it

1. Start with the sample or add your own palette colors.
2. Add up to six PNG, JPEG, WebP, or GIF sketch frames under 8 MB each.
3. Inspect pairs under approximate color-vision conditions.
4. Apply a bounded lightness alternative when it helps.
5. Download field notes as JSON for your sketch.

The tool uses sRGB matrix approximations for protanopia, deuteranopia, and
tritanopia. It is a prompt for inspection, not accessibility certification.

## Demo and privacy

The demo route is `/demo`. Its sample palette is stored only under the
`demo:generative-palette-a11y:study` browser key. **Reset demo** restores the
sample. **Start for real** removes the demo key and opens a separate starting
study.

Frames are processed in the browser and are not uploaded. The core tool needs
no account. After the first online visit, the service worker lets the app
reload offline with its supplied sample assets.

See [Privacy](/privacy/) and [Terms](/terms/).

## Develop and test

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:browser
```

`npm test` runs the color-metric unit tests. `npm run test:browser` builds the
site and runs the browser, accessibility, mobile reflow, demo, offline,
privacy, export, and recovery checks.

Each public claim is independently runnable from a clean checkout:

```sh
npm run test:browser -- --grep @claim:demo-sandbox
npm run test:browser -- --grep @claim:sample-analysis
npm run test:browser -- --grep @claim:offline-reload
npm run test:browser -- --grep @claim:local-processing
npm run test:browser -- --grep @claim:json-export
npm run test:browser -- --grep @claim:frame-limit
```

## Deploy

Run `npm run build` and deploy the generated `dist/` directory. `index.html`
is at its root. The build generates a content-versioned service worker and
includes Azure Static Web Apps headers and routing in
`dist/staticwebapp.config.json`. No runtime service or environment variable is
required.

Released under the [MIT License](LICENSE).
