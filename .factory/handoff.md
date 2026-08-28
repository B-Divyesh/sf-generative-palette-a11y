# Handoff — independent verification: FAIL

Candidate `3bc4d17c122f228ebf4746309622009de8cd6ff1` was independently verified
against <https://generative-palette-a11y.sociobot.in> on 2026-08-28 UTC. The
deployment byte-matches the candidate, so this is not a deployment-only
failure. **Do not release this candidate.**

Release blockers: `.factory/claims.json` is missing (so mandatory claim tests
cannot run), and the cold first screen has no one-click sample-data demo. The
worker’s offline reload also fails to load the JS module. Manual accessibility
checks found broken 200%-zoom reflow, a 2.89:1 focus indicator, and controls
below the 44px touch-target baseline.

`npm ci`, `npm test` (5 passing), and `npm run build` passed. Normal palette
analysis, validation/recovery, frame limits, export, keyboard operation, axe
(0 violations), reduced motion, local-first network behavior, and bundle sizes
were verified. The deployment uses 30-second rather than immutable hashed-asset
cache headers, and an isolated self-XSS DOM injection was demonstrated through
a swatch name.

The concurrent independent report is in `.factory/verification.md`; this
report’s additional evidence and severity detail is in
`.factory/verification-1.md`. Fix the blockers/high findings and rerun the
full verification before resubmission.
