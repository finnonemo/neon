---
scenarios:
  - request: Build a Campaign Page from a named Theme Brief and a supplied Reference Design
    observe: Lists briefs with `theme-brief.mjs list` and adds the brief; runs `match` on the style file; Brand Intensity governs the Reference Design and the brief contributes only its Immersive Theme's colors; records both `referenceDesign` and `themeBrief`; no source-brand string
  - request: Build a Campaign Page from a Refero `./DESIGN.md` in an empty workspace
    observe: Takes the Reference Design route at Blended and offers the dial; no source-brand string
  - request: "Follow-up in an app holding `./docs/theme-briefs/club-run.md`: add an FAQ section"
    observe: Recognises the brief with `match`; keeps `immersiveTheme="club"`; offers no Brand Intensity dial; leaves `referenceDesign` unset
  - request: Build a Campaign Page from a Refero file retitled with a Theme Brief header that no registry item has
    observe: "`match` says Reference Design; the report says the header matches no Theme Brief; Reference Design route at Blended with the dial; no source-brand string"
---

# Theme Briefs

Cases 2, 3, 4 and 7 of the Theme Brief spec (finnonemo/neon#113), for #123: how `neon-create` lists and recognises Theme Briefs before the Reference Design route. Each request ran once with the current `main` package as baseline (`1fe573f`) and once with this change as revised (`2604741`), November 2026. The runs used Claude Code 2.1.316 with `run-claude-case.mjs --model claude-opus-5-5 --serve-registry --cap 2700`, the runner's allowlist and permission note, and the browser tool. `--serve-registry` served this checkout's Neon registry, which holds the Theme Brief items on both arms, because the pinned release serves no registry yet (#127).

Fixtures, in `.local/evals-fixtures/123/`:

- **Lumora `./DESIGN.md`**: the synthetic dark event style from [Reference designs](reference-design-evaluation.md): lime `#C6FF3D` actions, ultraviolet `#7A5CFF`, Space Grotesk, the line "See further.". Any of those, or "Lumora", in the app's `./src/` or `index.html` is a leak.
- **Retitled file**: the same body under `# Finnomena Ultra · Gala — Theme Brief`, an `**Immersive Theme:** ultra` line and the published status paragraph with Club changed to Ultra. No registry item is called Ultra · Gala.
- **Club Run app**: a Neon-base app made with `install.mjs --new` and `--add theme-brief-club-run`, whose `./src/App.tsx` passes `immersiveTheme="club"` to `ImmersiveLayout`. The runner pointed its `components.json` `@neon` entry at the served registry.

Requests, verbatim; each new-app arm had its own port:

> /neon:neon-create Create a campaign landing page in ./club-run for Finnomena Club Run 2026, a 5 km and 10 km fun run for Finnomena Club members at Lumpini Park on Sunday 7 December 2026, from the Club · Run Theme Brief, using ./DESIGN.md as the reference design. Use mock data. Run its dev server on port 5201.

> /neon:neon-create Create a campaign landing page in ./summit for the Finnomena Investor Summit 2026, using ./DESIGN.md as the reference design: a hero, the agenda, speakers and a sign-up call to action. Use mock data. Run its dev server on port 5203.

> /neon:neon-create The dev server for this app is already running at http://localhost:5191/. Add an FAQ section to the Club Run page with three questions: what to bring, whether there is parking, and how to get the race kit.

> /neon:neon-create Create a campaign landing page in ./ultra-gala for the Finnomena Ultra year-end gala dinner for Ultra members, following the Theme Brief in ./DESIGN.md. Use mock data. Run its dev server on port 5205.

| Case | Baseline | Revised |
| --- | --- | --- |
| `theme-brief.mjs` calls | None (not in the package) | Case 2: `list`, `match ./DESIGN.md`. Case 3: none. Case 4: `match ./docs/theme-briefs/club-run.md`. Case 7: `match ./DESIGN.md`, `list` |
| Case 2 route | Added `theme-brief-club-run`; "the brief won", so `./DESIGN.md` shaped only the section order, with no Brand Intensity level | `match`: Reference Design. Blended for `./DESIGN.md`; the brief gave only the Club colors; `./NEON-HANDOFF.md` records the brief and the reference with Brand Intensity Blended; offers the dial |
| Case 3 route | Reference Design at Blended; offers the dial | Reference Design at Blended; offers the dial |
| Case 4 route | Kept `immersiveTheme="club"`; no dial; read no reference-design procedure | `match`: Theme Brief. Kept `immersiveTheme="club"`; no dial; says the brief matches the registry version |
| Case 7 route | Read the header as a Theme Brief for Ultra: Ultra colors, no Brand Intensity level, no dial | `match`: "matches no Theme Brief"; says so; Reference Design at Blended; offers the dial; names `theme-brief-ultra-run` as the nearest real brief |
| Source-brand strings in the app | None in any case | None in any case |
| Cost (case 2, 3, 4, 7) | $3.13, $2.58, $0.61, $2.00 | $2.73, $2.16, $0.81, $3.34 |
| Verdict | Fail: cases 2 and 7 skip Brand Intensity for the Reference Design; cases 3 and 4 pass | Pass: all four cases |

The difference is in cases 2 and 7, where `main` let a Theme Brief header, real or retitled, override the Reference Design. Case 3's revised run did not run `match`: the request named `./DESIGN.md` as a reference design and the file has no brief header, so it read the reference-design line and not the Theme Brief reference. The route was still right. Case 4 shows no measurable difference: on `main` the brief already read as the page's direction without a check. The revised run confirmed it with `match`, which only shows the step runs. A `Differs` verdict and the re-add ran in no sample. Run logs, diffs and summaries are in `.local/evals/123-{c2,c3,c4,c7}-{baseline,revised}`; the run script and grader are in `.local/evals-fixtures/123/`.

Limits:

- One sample per arm, so the difference is what each package does once, not a measured rate.
- Lumora is a synthetic file, not a real Refero export, and the retitled file is hand-made.
- Costs are each run's last reported `total_cost_usd`, which is cumulative. Every new-app run hit the 2700-second cap after its closing report, because the dev server it started kept the session open. The reports and diffs are complete.
- Baseline case 7 is void under the denial rule: after its report, a denied `rm` led it to call the shell blocked. Its routing and report came before that.
- The browser tool was missing its Playwright dependency in these runs, so the agents judged pages from `probe-page.mjs` screenshots and no interaction was graded. Pages were graded on routing, the report and a source grep, not on how they look.
- The served registry is this checkout's; the released one may differ until it is tagged.
