# Demo sandbox

- **Demo URL:** `/demo` or `/?demo=1`
- **Sample:** “Night transit loop” has five named colors and two hand-authored
  generative sketch frames. Coral and moss are intentionally close under two
  approximate simulations, so the populated report has findings on entry.
- **Storage:** only `localStorage["demo:generative-palette-a11y:study"]` is
  written. The ordinary study has no storage key, and demo code never reads or
  writes one.
- **Reset:** **Reset demo** deletes the demo key and restores the supplied
  palette and frames.
- **Exit:** **Start for real** deletes the demo key and sends the visitor to
  `/`, where the separate starter palette is loaded.
- **Offline:** the build-generated service worker precaches the app shell,
  sample frames, and legal pages. After an online visit, `/demo` reloads
  offline with the sample data.

The claim tests in `.factory/claims.json` start from `/demo` in fresh browser
contexts.
