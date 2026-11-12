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

November 2026. No run recorded: these scenarios were added with the Design intent section of `skills/INSTRUCTION.md` and its uses in the four skills, and none has been run against a baseline. When one is run, record it here.

What changed: the contract now states the ideas its rules follow from, and a table of what is fixed and what the agent designs. `neon-create` asks for a design thesis before new UI and checks screenshots against it; `neon-redesign` looks at the rendered result after a shadcn value swap and acts within its tier; `neon-review` ties a look finding to an idea or rule and does not flag an unlisted composition; `neon-audit` says what its recommendation leaves open.

The ideas were drawn from the owner's Refero style notes for products with an ink-and-white interface (Uber, shadcn/ui, Vercel, Airbnb, Bolt), which agree on four points: an achromatic interface with color kept to content, hierarchy by size rather than weight, depth by surface step or hairline rather than shadow, and a small fixed set of radii. No value from those notes was copied; Neon's colors, type and radii still come from Core.

Limits: static checks only (`node scripts/validate.mjs`). Whether the thesis step changes what a run builds, and whether the freedom wording weakens the first-screen and functional-habit results in [First screen](first-screen.md) and [Functional screen habits](functional-screen-habits.md), is unmeasured; rerun those two before relying on this revision.
