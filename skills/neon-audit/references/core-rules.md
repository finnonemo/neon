# Core component rules

Core is Finnomena's design system. `<Neon root>/core/` is the Core snapshot, the copy of it Neon carries. Which component fits a job, its hierarchy, its states and its usage are Core's rules. Neon's contract and references link them here instead of restating them, and where the two differ Core's rule holds.

Read this when:

- about to choose a Neon item or one of its prop values, on the Neon base;
- about to draw a look or a component that no Neon item has, such as a value the item's header does not name;
- a review finding is about how a component is used;
- an audit reports which of an app's components have a Counterpart.

Colors-only and visual-system work reads no component doc, and neither does a restyle under `composition: 'preserve'`: they change roles, not which component or value an element takes.

## Find the doc

[The index](../../../core/index.json) has one entry per Neon item:

- `counterpart` and `doc`: the item's Counterpart and its Core doc, a path under `core/`. `values`, where present, is the doc's measurements. The Neon item already carries them, so skip that file.
- `counterpart: null` with `why`: the item has no Counterpart. Use it by the [design contract](../../INSTRUCTION.md) and its installed file.

Start from the index, even when a reference already names a doc: it says whether the item has a Counterpart. Look up only the items the task is about to use. Leave alone the docs of items the task does not touch, and do not list or browse `core/components/`.

## Read the rule

In the item's doc, read `## Usage` and, where the doc has one, `### Hierarchy` inside it: what the component is for, what it is not for, and which hierarchy its actions take. Every doc has a `## Usage` section, first or last. Find that heading and read from it to the next `## ` heading, or to the end of the file when none follows, not the whole doc. The other sections say how Core draws the component, which the Neon item already does, except in the case [below](#draw-what-no-item-has).

Which action is primary, secondary or tertiary is in [Core's hierarchy rules](../../../core/hierarchy.md): "Rules every component keeps" 1–6, and the owner's calls under them. Read it when a screen's actions are being chosen or judged; it is one file, not a component doc.

A doc speaks of Core's own components, so read it as follows:

- **Look:** Neon draws one look, `iOS=False`, Core's look for Android and web. A request for an iOS or iPhone screen takes it too, at phone width: [Composition](../../INSTRUCTION.md#composition). Skip what a doc says of iPhone, iPad, Android or a foldable.
- **Names:** a doc uses Core's value names (`Hierarchy=Primary`, `Type=Danger`). The installed item file's header says which prop value is which, and [Neon base](../../neon-create/references/neon-base.md#styling) lists Button's.
- **Components with no Neon item:** a doc may send a job to a Core component the registry has no item for, such as Button dock or Empty state. Its doc is in `core/components/` by the same name; follow its rule with Neon items and plain elements, never an invented import, and report the gap. Its colors come [from its doc](#draw-what-no-item-has).
- **Bookkeeping:** sample frames, page names, issue numbers, dates and draft notes are Core's records, not rules.
- **Scope:** a rule shapes new UI and `composition: 'adapt'`. Under `preserve` or colors-only scope a miss is an observation; it does not license restructuring.

## Draw what no item has

Two cases need a doc's token tables as well as its Usage: the item lacks the value the screen needs (its header names no such value, as `segmented-control` has no `Floating=True`), or Core's component has no Neon item. Then nothing in the registry holds the colors, and two people choosing by eye draw one component two ways. So:

1. In the doc, read `## Axes` and `## Component variables and Theme tokens`, or the sections holding its axes and tokens where they are named otherwise (and the contrast table, which names a pair's background), for that value and `iOS=False` only. Take the fill, stroke, label, radius and state each row gives. Choose none of them.
2. Turn each Core token into a Neon role with [the Role table](../../../theme/css/core-roles.json): the role that names the token, then the utility for that role in the app's `src/theme/neon.css` (`Border/border-strong` is `bgLineStrong`, `line-strong`). A near-looking role is not a match: `bg-card` does not stand for `Button/button-secondary`.
3. Put the look in one app component that every screen imports, never in each screen.
4. Where no role names the token but [Core's Theme](../../../core/theme.json) has it, use that token's Light and Dark values and report the missing role. Where no file gives a value (the `Categorical` chart colors) or two places in the doc disagree, ask which to use. When nobody can answer, use one value throughout, mark it unconfirmed and report the token: never a fixed hex presented as Core's.
5. Report each such component with the doc and the rows it took: "Core `segmented-control.md` › Item on `Floating=True`: selected fill `background-primary`, stroke `border-strong`". The source lint's `item-color` warning on it is kept with that citation.

## Rules for every screen

Three snapshot files hold Core's rules that belong to no one component. Each is one file: read the part the task needs, not the whole.

- [Foundations](../../../core/foundations.md): control sizes, the Hit target and row heights; how a number, a unit, a sign, an empty value and a date are written; the accessibility floor (WCAG 2.2 AA, the contrast targets, the focus ring, the smallest text); the motion tokens and their reduced-motion form. Read its part when a screen formats figures or dates, when a review finding is about contrast, focus or target size, or when a transition is being given a duration.
- [Motion tokens](../../../core/motion.json): the same tokens as data. A component doc names a transition as `moderate-02 · entrance`; this file gives the milliseconds and the `cubic-bezier`.
- [Screen templates](../../../core/patterns/screen-templates.md), with [the layouts as data](../../../core/patterns/screen-templates.json): which Areas (Sidebar, Content, Inspector, Bottom Navigation) Core's own screens show at each of its breakpoints, and how wide. It is a reference for what Core draws. An app's layout still follows [functional patterns](functional-patterns.md) and its own breakpoints.

Cite them as a component doc is cited: "Core `foundations.md` › Numbers and dates: units follow the number".

## Cite a rule

A finding or a choice that rests on Core names the doc, the section and the rule, in Core's words kept short: "Core `hierarchy.md`, rule 4: Tertiary is for ways out", or "Core `alert.md` › Usage: not for a form or long content". Cite only a rule read in the snapshot this session. For an item with no Counterpart, say so and rest the finding on the design contract instead.

## Counterpart coverage

An audit lists the files in the app's `src/components/ui/` and, for each Neon item among them, gives its Counterpart from the index, or "none" with the entry's `why`. The index is keyed by Neon item name, so a file is matched to it only when it is the Neon item: the app's `components.json` names an `@neon` registry and the file carries Neon's header comment. A stock shadcn item, a CDS component or the app's own has no Counterpart recorded, even under a matching file name: say that in one line and do not guess one. This reads no component doc.
