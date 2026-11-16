# Neon holds at bug fixes until the web gate passes, and takes Core's side where their rules differ

> Status: Proposed, 2026-11-17. This text is not yet reviewed by the owner.

The owner is moving the focus to Core's `screenflow` plugin: an agent that draws a Figma Screenflow matching the Brief comes first, and Neon follows, building web code from the same docs, rules and usage (Core's ADR 0021; decided in a grilling session, each round answered "ใช่", confirmed "ยืนยัน" on 2026-11-17). Until then nothing measures whether a Neon screen is what was asked for: `evals/skills/` gives a blind preference, and there is no reference design to compare with. Reading the two rule sets side by side also found places where `skills/INSTRUCTION.md` and Core say different things.

## Decisions

- **Neon takes bug fixes and Core resyncs only, until the web gate passes.** The gate is Core's: 80% or more on unseen Briefs in two consecutive runs, per Screen type (Core's ADR 0021). No new skill behaviour, layout or registry item lands before it. A resync still arrives as a pull request ([ADR 0012](0012-core-compiles-the-snapshot-and-holds-the-palette.md)).
- **Neon stays out of Figma.** [ADR 0009](0009-neon-matches-core-not-cds.md) and [ADR 0010](0010-neon-carries-blocks-engine-and-ships-as-finno.md)'s "Neon builds no connector to Figma" stand. Drawing in Figma is the `screenflow` plugin's job. Campaign Pages and Brand Artwork stay Neon's.
- **The same Brief set scores Neon.** Core keeps the set and the rubric. Neon keeps its own harness, and its judge changes from a preference to a score per axis.
- **Where the two rule sets differ, Core's wins:**
  - **Button dock and tab bar.** Core: a screen with a Button dock has no Bottom Navigation. INSTRUCTION.md §Feature states says a focused flow "docks its primary action at the bottom without overlapping a tab bar", which lets both show. It changes to Core's rule.
  - **Sidebar widths.** Core's [screen-templates](https://github.com/pawisssh/design-system/blob/main/docs/patterns/screen-templates.md) (Approved 2026-11-08): Sidebar 64 from LG 988, 240 from XL 1080, 320 from XXL 1272. `docs/design/starter-workspace-shell.md` has a 64 rail from 500 to 1279 and a 240 sidebar from 1280, measured from the order-history site. The shell takes Core's table; the change is a registry change with its own issue, as [ADR 0011](0011-a-functional-screen-has-four-layers-each-with-one-source.md) asks.
- **ADR 0011's Shell row is due.** It kept the CDS starter's shell because "Core has no approved web shell to replace it", and said "When Core approves a web shell, this ADR's first row changes". Core now has one: five layouts with web breakpoints. The shell's source becomes Core's Screen templates, and `registry/core-counterparts.json` gains the layouts. The rebuild itself waits for the gate.
- **Two rules that looked opposed are about different things, and both stand.** Core: a screen that matches no Blueprint is a gap, never a stretch of the nearest type. INSTRUCTION.md: when no shell layout fits, take the nearest and report what didn't fit. The first is about the kind of screen, the second about the layout around it. Core's spec says so in Revision 18 (R11); INSTRUCTION.md gains one sentence to match.
- **Core changes to meet Neon once.** INSTRUCTION.md has "the inspector holds its action"; Core's rule named no Primary Button there. Core amends its rule (Revision 18 R12), so Neon's line stands.
- **Gradients and the typeface stay Neon's own rules.** The Gradient Recipes ([ADR 0003](0003-gradients-from-palette-recipes.md), [ADR 0014](0014-immersive-themes-take-gradient-recipes.md)) are for Campaign Pages, and functional screens still use none. IBM Plex Sans Thai is Neon's web typeface, while Core draws in Finnomena Trek. Neither goes upstream.
- **Rules that hold on both targets move to Core after the pilot.** They are written once there and reach Neon through the Core snapshot. Core's compile doesn't carry its rules or Blueprints today, so until it does INSTRUCTION.md keeps them.

## Considered

- **Tune Neon first, or both at once:** rejected. With no reference design a web result can't be scored, and two targets changing together hide which rule was wrong.
- **Give Neon a Figma connector:** rejected again, for ADR 0010's reason and because Core's plugin already draws.
- **Keep the order-history breakpoints:** rejected. They were measured from one live page; Core's table is approved and covers every layout.

## Open

- Whether the Sidebar change lands during the hold (as alignment with Core) or with the shell rebuild after the gate: not decided.
- What counts as a bug fix when a Campaign Page needs something new during the hold: not decided.
