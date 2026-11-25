---
scenarios:
  - request: Build a Campaign Page on the Exclusive Immersive Theme that tells a company's story, with no Theme Brief, Reference Design or images
    observe: Designs the page with its own ability before theming; opens no Theme Brief, example or functional pattern; after theming no color literal is left in the page, and switching theme recolors it and moves nothing; logo and typeface hold.
---

# Free campaign design

> The first run predates [ADR 0019](../../../docs/adr/0019-campaign-page-rules-are-brand-only.md), which retired its contrast, motion and claims checks and rewrote the prompt. The second run uses the new prompt.

Added with [ADR 0018](../../../docs/adr/0018-the-agent-designs-campaign-pages-and-neon-themes-them.md).

## First run: before ADR 0019

Fixture: an empty folder. Request: a Campaign Page in `./fifteen-years` on Exclusive for Finnomena's 15th anniversary, with the company's story (2011, 2016, 2020, 2026) and an invitation, a Thai headline, no Theme Brief, Reference Design or images.

November 2026, one Claude Code subagent on commit `d1397b9`, outside the harness, one sample, no baseline. "Run" is the run's own report; "Evaluator" was checked afterwards.

| Check | Result | Verdict |
| --- | --- | --- |
| Own design | Evaluator, screenshots: a thread of beads carries all six sections, drawn in SVG; own page root, no Brand Pattern | Pass |
| Opens no Theme Brief, example or functional pattern | Run: its list of files read names none; it read `theme-brief.md` to decide, and functional-screen guidance it did not need: `new-ui-workflow.md` and part of `core-rules.md` | Pass |
| No color literal left | Evaluator: no hex, rgb, hsl or oklch value in `src/campaign`'s CSS and TSX | Pass |
| Switching theme moves nothing | Run: the boxes of every non-SVG element hash the same before theming and in four themes at both widths. Evaluator: the four 1440px captures look alike in layout | Pass |
| Logo and Thai | Evaluator: in view at 1440px in all four themes and at 375px on Exclusive. Run: IBM Plex Sans Thai loaded | Pass |
| Contrast | Evaluator, calculated from the theme CSS: every ground and text pair the page uses is 8.17:1 or more in all four themes; nothing lowers text opacity. Control boundaries not measured | Pass, text only |
| Reduced motion | Run: motion off, all captures taken under it; not repeated | Unverified |

The run found the text unclear or contradictory in six places, since reworded: `ImmersiveLayout` read as required, whether an illustration may mix color families, whether a theme may map a page variable differently, whether a plain link may stand in for an `@neon/` item, how the review build differs from the launch build, and a Look and fix ranking that kept task hierarchy and color schemes. The reworded text has not been run. Left open: no property names a full-section inverse such as navy on Exclusive, so the run avoided a navy section; campaign content does not say when the claims list is written. The word กองทุน made a company-history page Brand-ready, as readiness intends. Limits: the subagent shared the repository, whose `AGENTS.md` reached its context; 375px captures of Club, Private and Ultra were not viewed; the app and captures stayed local.

## Second run: the ADR 0019 prompt

November 2026, the same request, one Claude Code subagent on commit `4705edb`, outside the harness, one sample, no baseline. An authentication failure interrupted it once; the same agent resumed from its files. "Run" is its own report; "Evaluator" was checked afterwards on the production preview, in headless Chrome with a software renderer.

| Check | Result | Verdict |
| --- | --- | --- |
| Own design | Evaluator, screenshots: a scroll-driven three.js scene of one table that grows from three friends to 300 people and spells 15 from above, then turns to evening; own page root, no Brand Pattern | Pass |
| Opens no Theme Brief, example or functional pattern | Run: its list of files read names none; it names `neon-block`'s skill file, unused | Pass |
| No color literal left | Evaluator: no hex, rgb, hsl, oklch or 0x color in `src/campaign`'s CSS, TSX and TS | Pass |
| Switching theme moves nothing | Evaluator, motion on: the boxes of every element outside the scene, the year and SVG hash the same in four themes at 1440px and at 375px, with no sideways scroll and no console error. Scene frames look alike in all four | Pass |
| Logo and Thai | Evaluator: logo in view at the top in four themes at both widths; IBM Plex Sans Thai is the only computed family and loads | Pass |
| `neon-review`, Campaign Pages | Evaluator: no brand finding. Visibly broken, minor: at 375px the invitation's lower half is an empty ground with motion on; a phone edge crosses the 2020 view as the camera passes it; the review build's toggle overlaps passing cards | Pass with findings |

The design is more ambitious than the first run's (one sample each, judged by eye by the agent that wrote the prompt). Changed after the run, and not run since: page variables take a prefix, because the page's `--card` took the Neon base's value; the launch build names an environment variable. Left open: the run said designing before theming added nothing for a WebGL scene; full-page capture misses a fixed scene; the word กองทุน again made the page Brand-ready with a disclaimer placeholder. Limits: no real GPU, phone, frame rate, Safari, Firefox or click on the live toggle; the subagent's context held `AGENTS.md`; the app and captures stayed local.
