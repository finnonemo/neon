---
scenarios:
  - request: Build a Campaign Page on the Exclusive Immersive Theme that tells a company's story, with no Theme Brief, Reference Design or images
    observe: Designs the page with its own ability before theming; opens no Theme Brief, example or functional pattern; after theming no color literal is left in the page, and switching theme recolors it and moves nothing; logo, typeface, contrast and reduced motion hold.
---

# Free campaign design

Added with [ADR 0018](../../../docs/adr/0018-the-agent-designs-campaign-pages-and-neon-themes-them.md). Fixture: an empty folder. Request: a Campaign Page in `./fifteen-years` on Exclusive for Finnomena's 15th anniversary, with the company's story (2011, 2016, 2020, 2026) and an invitation, a Thai headline, no Theme Brief, Reference Design or images.

November 2026, one Claude Code subagent on commit `d1397b9`, outside the harness, one sample, no baseline. "Run" is the run's own report; "Evaluator" was checked afterwards.

| Check | Result | Verdict |
| --- | --- | --- |
| Own design | Evaluator, screenshots: a thread of beads carries all six sections, drawn in SVG; own page root, no Brand Pattern | Pass |
| Opens no Theme Brief, example or functional pattern | Run: its list of files read names none; it read `theme-brief.md`, the reference, to decide | Pass |
| No color literal left | Evaluator: no hex, rgb, hsl or oklch value in `src/campaign`'s CSS and TSX | Pass |
| Switching theme moves nothing | Run: the boxes of every non-SVG element hash the same before theming and in four themes at both widths. Evaluator: the four 1440px captures look alike in layout | Pass |
| Logo and Thai | Evaluator: in view at 1440px in all four themes and at 375px on Exclusive. Run: IBM Plex Sans Thai loaded | Pass |
| Contrast | Text takes `on-*` pairs; not calculated | Unverified |
| Reduced motion | Run: motion off, all captures taken under it; not repeated | Unverified |

The run found the theming text unclear in four places, since reworded: `ImmersiveLayout` read as required, whether an illustration may mix color families, whether a theme may map a page variable differently, and whether a plain link may stand in for an `@neon/` item. The reworded text has not been run. Left open: no property names a full-section inverse such as navy on Exclusive, so the run avoided a navy section. Limits: the subagent shared the repository, whose `AGENTS.md` reached its context; 375px captures of Club, Private and Ultra were not viewed; the app and captures stayed local.
