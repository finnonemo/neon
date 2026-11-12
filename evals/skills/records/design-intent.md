---
scenarios:
  - request: Build a Finnomena Back Office screen whose task fits no listed pattern (a week-by-advisor capacity planner)
    observe: Before building, the run writes a design thesis (what is first-read, how regions separate, where color appears, what no pattern covers); the composition is its own, built from Neon items, type roles and color roles; the report states the choice and its reason; one primary action; no tinted tiles or shadows on on-page regions.
  - request: Restyle a v0 shadcn app to Finnomena at visual-system scope (the look after the values)
    observe: After mapping values by role, the report names the stock shadcn habits a user would notice (card shadow and border, decorative chart or sidebar color, weight doing the work of size); it overrides the on-page shadow steps in `@theme` and sets radius in the stylesheet, edits no component file, and reports a pill button as needing a component edit.
  - request: Restyle a v0 shadcn app to Finnomena, colors only (the look after the values)
    observe: The same habits are reported as observations; radius, shadow, spacing and markup are unchanged.
  - request: Review a Finnomena Back Office screen with an unlisted but task-led composition; do not edit
    observe: No finding for the composition being unlisted; each finding about the look names the design intent idea or contract rule it rests on, with visible evidence; no file edited.
---

# Design intent

November 2026. Scenarios 1 to 3 and a first-screen build were run once per arm, revised (`00d4dcb`) against baseline (`afde360`), with `run-claude-case.mjs` on Claude Code 2.1.322 and `claude-opus-5-5`. Scenario 4 (review) has no run.

| Case | Arm | Cost (USD) | Turns | Minutes | Denied commands |
| --- | --- | --- | --- | --- | --- |
| Restyle, visual-system | revised | 1.69 | 56 | 4.0 | 0 |
| Restyle, visual-system | baseline | 2.12 | 73 | 5.3 | 2 |
| Restyle, colors only | revised | 1.21 | 38 | 2.6 | 0 |
| Restyle, colors only | baseline | 1.36 | 46 | 3.6 | 1 |
| Capacity planner | revised | 2.92 | 70 | 10.3 | 0 |
| Capacity planner | baseline | 3.32 | 94 | 10.9 | 0 |
| Fee report | revised | 2.41 | 70 | 9.6 | 0 |
| Fee report | baseline | 3.37 | 112 | 11.2 | 1 |

Every run ended on a result with a report, none at the turn cap, and all four builds reported Brand-ready.

**Restyle, visual-system: met, except the pill.** The revised run changed `index.html`, `src/index.css` and one class in `src/App.tsx` (`text-destructive` to `text-negative`, for dark contrast, reported). It turned off `--shadow-xs` and `--shadow-sm` in `@theme`, pinned the radius steps, and reported `font-semibold` as needing markup. It did not report the pill button as needing a component edit. The baseline edited `badge.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `utils.ts`, `main.tsx` and `package.json`, and left `shadow-xs` on the input.

**Restyle, colors only: met.** The revised run changed `src/index.css` alone and reported the card shadow as an observation. The baseline also changed `src/App.tsx` and reported no habit.

**Capacity planner: thesis not met; look met in both arms.** Neither arm's messages contain a design thesis, and the revised report does not state its composition choice and reason. Both arms built the same composition (advisor by day grid, day detail panel, All / Over / Under filter), without shadows or a competing primary action. The revised grid tints only over-capacity cells and carries under-booking as text in the week column; the baseline tints both, which colors about a third of its cells.

**Capacity planner, thesis step reworded (`7ab3731`): reported, not written first.** The thesis became its own item in step 2 with a fixed line shape, repeated in the Done report. One rerun (2.76 USD, 63 turns, 8.6 minutes, no denied command) gives all five thesis lines in its report and names one departure (panel order), and adds a region the earlier runs lack: the room other advisors have on the selected day. The lines first appear in the final message, after the first source write, under the heading "as stated before building", which the transcript does not support. The Done wording now asks a run to say so when the thesis was written after the build; that wording has no run.

**Fee report: first screen kept.** At 1440×900 both arms show the table heading and seven complete rows with one total above the table, so the freedom wording did not weaken the [first screen](first-screen.md) result in this sample. The revised run's sidebar has no navigation item.

What the runs do not show: no run wrote a thesis before building, so whether a thesis changes a build is still unmeasured; lower cost and turns in the revised arm are one sample each and may be noise; the [functional screen habits](functional-screen-habits.md) record was not rerun.

What changed: the contract now states the ideas its rules follow from, and a table of what is fixed and what the agent designs. `neon-create` asks for a design thesis before new UI and checks screenshots against it; `neon-redesign` looks at the rendered result after a shadcn value swap and acts within its tier; `neon-review` ties a look finding to an idea or rule and does not flag an unlisted composition; `neon-audit` says what its recommendation leaves open.

The ideas were drawn from the owner's Refero style notes for products with an ink-and-white interface (Uber, shadcn/ui, Vercel, Airbnb, Bolt), which agree on four points: an achromatic interface with color kept to content, hierarchy by size rather than weight, depth by surface step or hairline rather than shadow, and a small fixed set of radii. No value from those notes was copied; Neon's colors, type and radii still come from Core.

Limits: one sample per arm, graded by the author of the change from the run reports, diffs and 1440px and 375px screenshots of the built apps; no interaction was exercised beyond what each run reported.
