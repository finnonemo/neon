# Reference design evaluation protocol

This protocol checks that Brand Intensity changes how much of a reference design survives while the Brand Floor holds. Reference design files from Refero Styles carry no stated license, so they and every generated page stay under `.local/evals/reference-design/`; only prompts, checks and a verified report may be tracked.

## Inputs

Pick two styles with clearly different character: one light, minimal style and one dark, high-contrast style. Use Refero styles, recording each style's name, URL and retrieval date in the local run notes, or synthetic styles written for an invented brand, whose name then doubles as a leakage probe. Use a fresh empty destination per sample.

## Requests

Run each request once per style, at each level, three samples per cell:

> Build a Finnomena landing page for an internal learning program using the attached design file as a reference. Include a hero, program overview, schedule and a "Learn more" action linking to https://example.com/program.

For Finnomena-led and Reference-led, append "Make it look as Finnomena as possible" or "Keep it as close to the reference as possible". Separately, from a Blended result, run the follow-ups "ให้ดู finnomena มากขึ้น" and "use the reference's own colors and font".

## Checks

For every sample, at 375px and 1440px:

- **Level fidelity:** properties the level allows are visibly taken from the reference (structure; then geometry and motion; then neutral surfaces), and nothing beyond them.
- **Brand Floor:** Finnomena logo, IBM Plex Sans Thai for Thai and Latin text, Finnomena action colors, readable contrast for text and actions, no source-brand name, logo, imagery, copy or font file in the page, metadata or alt text.
- **Dial behavior:** Blended is used without asking; a follow-up moves one level; a request beyond Reference-led is declined with the Brand Floor explained; content and composition are unchanged across dial moves.

Record screenshots, the files the agent read, questions asked and the reported level. A failed or missing check stays failed or missing. Screenshot comparison supports level fidelity only as a reviewer judgment; label it as such rather than as a measurement.
