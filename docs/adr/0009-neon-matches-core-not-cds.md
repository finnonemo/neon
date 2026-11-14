# Neon matches Core, not CDS

> Status: Amended by [ADR 0012](0012-core-compiles-the-snapshot-and-holds-the-palette.md) on 2026-11-14: Core's repository compiles the snapshot, and Neon's sync runs that compile and carries what it writes. The rest stands.

Neon's components, tokens and type scale are now matched to Core, Finnomena's own design system (`pawisssh/design-system`, "(v3) Components / Core"), in place of CDS 9.26.1. This supersedes [ADR 0008](0008-registry-grows-only-by-components-with-a-cds-counterpart.md), and the "look must match CDS" rule and sizing requirement of [ADR 0006](0006-new-work-on-shadcn-matched-to-cds.md). ADR 0006's base (shadcn/ui on Tailwind v4, Radix, React 19, the registry) stands, and CDS stays frozen for apps already on it. The change ships as Neon 1.0.0.

Why: CDS was a stand-in for a look Finnomena did not yet own. Core now has approved docs and specs for about fifty components, and its design owner maintains Neon. Neon's `theme/tokens/theme.json` is an older export of the same Theme collection Core records in its own `theme.json`: on 2026-11-12, 64 of the 111 token names both hold had different values, and Core held about 388 names Neon lacks. Matching CDS left every unclear mapping "provisional, pending a design owner" (issues #194–#209); matching Core answers them from an approved doc.

## Decisions

- **Core snapshot.** Employees cannot read Core's repository, so Neon carries a compiled copy pinned to one Core commit. A Neon script compiles it from Core's approved component docs, their `spec.json` files, `theme.json` and the hierarchy rules, and drops what the web does not use: Figma node ids and keys, the `iOS=True` look, Revision history and Dynamic Type. The repository check refuses a hand edit to it. Core's screenflow skill-set is not reused, because it carries Figma placement and no sizing.
- **Web look.** A Neon item takes its Counterpart's `iOS=False` look at the Large text size, in light and dark. Liquid Glass and Dynamic Type stay native.
- **Tokens.** Core's `theme.json` is the one source of Neon's token export; the CSS adapter and the shadcn slot mapping are remapped from it. The frozen CDS theme files keep their values.
- **Type.** Neon keeps IBM Plex Sans Thai and takes the sizes, tracking and line heights of Core's text styles, with each Neon type role mapped to one. Core's typeface, Finnomena Trek, has no web font files in either repository; moving to it is a later decision.
- **Provisional ends where Core approves.** A mapping that traces to an approved Core doc or a Core Theme token is no longer provisional. Immersive Themes and gradient recipes are not in Core and stay provisional.
- **Measurement.** The CDS-match eval's baseline becomes the Core snapshot's spec values in place of the CDS fixture: the same properties, within ±1px, at 375px and 1440px.
- **Names and props follow shadcn, and 1.0 only adds.** An item keeps its shadcn name and props; the Catalog shows its Counterpart's name. Each existing prop value maps to a Core cell (button `default` to Primary Default, `destructive` to Primary Danger). Values Core has and shadcn lacks (Brand, Inverse, Loading) are added. A value with no Core cell, such as `outline`, still works, is marked as not in Core, and is not chosen for new work. Sizes map to the nearest Core size (button `default` 54 to Large 56, `sm` 40 to Small 36), with `md` and `xs` added; Expressive sizes wait.
- **Items with no approved Counterpart keep their CDS tuning** and say so: card. Checkbox, calendar and date-picker were on this list until each was retuned to its Counterpart: Core's Checkbox, Date and time and Date picker. Dialog is matched to Core's Alert at `iOS=False`, which Core's ADR 0014 folded Dialog into.
- **Growth.** After 1.0, a new item needs an approved Core Counterpart with a web look: an `iOS=False` look or an app-drawn set. Components only Core has (amount field, allocation bar, PIN code, stepper, slider) qualify; components iOS alone draws do not.
- **Rules.** Component-level rules (hierarchy, states, usage) come from the Core snapshot. Brand and screen-level rules (color roles, composition by work type, Immersive Themes, the Brand Floor, gradients, reference designs) stay in `skills/INSTRUCTION.md`, which links to the snapshot instead of restating it. Skills read a component's Core doc only when they are about to use that component.
- **Existing apps opt in.** The registry stays pinned per release tag, so an app on 0.x keeps its look until it re-adds items from 1.0. Skills never upgrade an app unasked.

## Considered Options

- **Core first, CDS as the fallback for every gap:** rejected as the rule, kept only for the four items above, so two baselines do not become permanent.
- **Core for guidance only, components still measured against CDS:** rejected; the measured look would keep drifting from the one Finnomena designs in.
- **Props renamed to Core's axes (`hierarchy`, `type`):** rejected; it breaks existing apps and shadcn's docs stop applying.
- **Link skills to Core's repository:** rejected; only people with access to it would get its rules.
- **Move to Finnomena Trek now:** deferred until web font files and their license exist.

## Consequences

- Buttons and button-like controls become Capsules (corner radius half the height). This is the most visible change in 1.0.
- Token values change with the re-export, including text and border colors that affect contrast, so every changed pair is rechecked.
- English text takes Core's Thai line heights (Core's ADR 0012), so hugging components grow by a few pixels per line.
- Registry batch 3 (#177–#181) stops. Sidebar, navigation menu and chart are re-scoped after 1.0 against Core's Navigation, Line chart and Vertical bar; carousel is a pattern in Core, not a component, and is not added.
- The open "differs from CDS" and "design-owner decision" issues are re-triaged against the Core snapshot.
- Skills finish their move off CDS in 1.0: the Neon base is their default, and CDS guidance sits in references read only for an app already on CDS.
