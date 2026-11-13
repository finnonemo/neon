# Core component rules

Core is Finnomena's design system. `<Neon root>/core/` is the Core snapshot, the copy of it Neon carries. Which component fits a job, its hierarchy, its states and its usage are Core's rules. Neon's contract and references link them here instead of restating them, and where the two differ Core's rule holds.

Read this when:

- about to choose a Neon item or one of its prop values, on the Neon base;
- a review finding is about how a component is used;
- an audit reports which of an app's components have a Counterpart.

Colors-only and visual-system work reads no component doc, and neither does a restyle under `composition: 'preserve'`: they change roles, not which component or value an element takes.

## Find the doc

[The index](../../../core/index.json) has one entry per Neon item:

- `counterpart` and `doc`: the item's Counterpart and its Core doc, a path under `core/`. `values`, where present, is the doc's measurements. The Neon item already carries them, so skip that file.
- `counterpart: null` with `why`: the item has no Counterpart. Use it by the [design contract](../../INSTRUCTION.md) and its installed file.

Start from the index, even when a reference already names a doc: it says whether the item has a Counterpart. Look up only the items the task is about to use. Leave alone the docs of items the task does not touch, and do not list or browse `core/components/`.

## Read the rule

In the item's doc, read `## Usage` and, where the doc has one, `### Hierarchy` inside it: what the component is for, what it is not for, and which hierarchy its actions take. `## Usage` is each doc's last section, so find that heading and read from it to the end of the file, not the whole doc. The sections above it say how Core draws the component, which the Neon item already does.

Which action is primary, secondary or tertiary is in [Core's hierarchy rules](../../../core/hierarchy.md): "Rules every component keeps" 1–6, and the owner's calls under them. Read it when a screen's actions are being chosen or judged; it is one file, not a component doc.

A doc speaks of Core's own components, so read it as follows:

- **Look:** Neon draws the web look, `iOS=False`. Skip what a doc says of iPhone, iPad, Android or a foldable.
- **Names:** a doc uses Core's value names (`Hierarchy=Primary`, `Type=Danger`). The installed item file's header says which prop value is which, and [Neon base](../../neon-create/references/neon-base.md#styling) lists Button's.
- **Components with no Neon item:** a doc may send a job to a Core component the registry has no item for, such as Button dock or Empty state. Its doc is in `core/components/` by the same name; follow its rule with Neon items and plain elements, never an invented import, and report the gap.
- **Bookkeeping:** sample frames, page names, issue numbers, dates and draft notes are Core's records, not rules.
- **Scope:** a rule shapes new UI and `composition: 'adapt'`. Under `preserve` or colors-only scope a miss is an observation; it does not license restructuring.

## Cite a rule

A finding or a choice that rests on Core names the doc, the section and the rule, in Core's words kept short: "Core `hierarchy.md`, rule 4: Tertiary is for ways out", or "Core `alert.md` › Usage: not for a form or long content". Cite only a rule read in the snapshot this session. For an item with no Counterpart, say so and rest the finding on the design contract instead.

## Counterpart coverage

An audit lists the files in the app's `src/components/ui/` and, for each, gives its Counterpart from the index, or "none" with the entry's `why`. A component with no index entry (a stock shadcn item, a CDS component, the app's own) has no Counterpart recorded: say that in one line and do not guess one. This reads no component doc.
