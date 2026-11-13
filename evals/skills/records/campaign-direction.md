---
scenarios:
  - request: Build a Campaign Page for a members' fun run from the Club · Run Theme Brief, with no images supplied
    observe: Writes the direction lines beside the design thesis before building; a display role carries a fact below the hero; no large labelled image slot stands in for a missing image; at most two motion moments, each visible under reduced motion; the report lists where the build departs from the brief's picks.
---

# Campaign direction

How `neon-create` composes a Campaign Page on an Immersive Theme, after adding [campaign direction](../../../skills/neon-create/references/campaign-direction.md). One request ran once with `main` as baseline (`8b6161e`) and once with this change as revised (`382abfd`), November 2026, at the same time. The runs used Claude Code 2.1.323 with `run-claude-case.mjs --model claude-opus-5-5 --serve-registry`, the runner's allowlist and permission note, and the browser tool, each in a workspace holding only `.gitkeep`. `--serve-registry` served this checkout's Neon registry to both arms.

Request, verbatim; the revised arm used port 5212:

> /neon:neon-create Create a campaign landing page in ./club-run for Finnomena Club Run 2026, a 5 km and 10 km fun run for Finnomena Club members at Lumpini Park on Sunday 6 December 2026, from the Club · Run Theme Brief. Use mock data. Run its dev server on port 5211.

The evaluator rebuilt each app, served its `dist` and measured it in headless Chromium at 1440×900 and 375×812 after scrolling the page once: computed font sizes of rendered text, elements as wide as the viewport with their own background, and the radius and padding of narrower filled blocks. It then looked at full-page and first-screen captures of both arms.

| Item | Baseline | Revised |
| --- | --- | --- |
| Skill files read | SKILL.md, INSTRUCTION.md, readiness, campaign content, Neon base, scaffold, Theme Briefs, verification | Same plus campaign direction and the workflow contract |
| Direction lines in `./NEON-HANDOFF.md` | None; the five thesis lines only | `Register`, `Scale`, `Grounds`, `Motion` and `Assets`, each filled |
| Largest type | 60px, the hero name (54px at 375) | 92px, the date numeral in the hero, at both widths |
| Facts in a display role below the hero | None: distances and the deadline at 28px or less. The only 54px text is four sample bib numbers in the closing band | Distances `5` and `10` and the deadline at 54px, the three pickup days at 60px |
| Labelled image slots | Two large empty slots: the hero photo and the course map | None: a date block stands in the hero and a drawn loop with numbered checkpoints in the route block; both are listed as assets awaiting supply |
| Full-width grounds beside the hero | One: the closing Light Grey 100 band | Two: the form on a Light Grey 100 band and the pickup days on Light Grey 50 |
| Motion | None, though the brief's level is subtle; reported as a departure | Two moments, as its `Motion` line states: schedule rows and pickup cards rise 16px and 12px and fade in once. `opacity` and `transform` only; the hidden start applies only under an attribute a script sets, and a `prefers-reduced-motion` rule shows the rows at once |
| Departures from the brief in the report | Motion and the missing Brand Pattern | The display roles in place of `title2`, the deadline block's ground, the unequal route and schedule split, the dropped proof section |
| Block shapes | One radius (24px) on every block; padding 24px to 48px | One radius (24px) and one padding on every block |
| Hero | Split, text beside an empty image slot | Split, text beside the date block |
| Cost, turns, time | $2.89, 79 turns, 7 min | $4.13, 110 turns, 11 min |
| Verdict | Fail: no direction lines, no fact in a display role below the hero, two empty image slots, no motion | Pass: every observed item; the limits below still hold |

Neither page overflowed sideways at either width. Both ran two Look and fix rounds.

What the change did not move: both pages keep the brief's skeleton, a split hero, a row of equal distance cards, a call-out block, then route and schedule blocks, all at the brief's one radius. The reference says a brief's section order, hero pattern and picks stand, and the run kept to that, so how different a brief page can look is still set by the brief. The revised page also has two defects of its own: a 64px empty canvas band between the header and the hero at both widths, which the baseline run found and removed in its own Look and fix, and a hero name set in a regular weight that reads weaker than the baseline's at 1440px. Its thesis names a Yellow 50 call-out band that the build then replaced with a block on the canvas; the report says so.

Run logs, reports and apps are in `.local/evals/direction-{baseline,revised}`; captures and the measuring script are in `.local/evals/direction-shots`.

Limits:

- One sample per arm, so the difference is what each package did once, not a rate.
- The evaluator wrote the change and judged the captures, and knew which arm was which. No blind judge compared them.
- The runner reported both cases as failed: its diff step met the app's own repository inside the workspace. Each run had already ended on its result event, with no void.
- Each run was denied one heredoc append to `./NEON-HANDOFF.md` and wrote the summary another way.
- Reduced motion was read from the CSS and script, not emulated, and the motion was not watched playing.
- The request supplied no images and named a brief, so composing around supplied assets, a page with no brief, and a Reference Design were not exercised. Only the Club theme ran.
- Costs are each run's last reported `total_cost_usd`.
