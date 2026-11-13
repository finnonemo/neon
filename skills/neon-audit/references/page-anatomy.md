# Page anatomy

Read when laying out a whole new functional page (Back Office or Product Feature) in an app with a shell: which layout it takes, what each pane holds and the order of its regions. [Functional patterns](functional-patterns.md) covers the parts inside a region (rows, actions, overlays); this covers the page around them. It shapes new UI and `composition: 'adapt'` only. Under `composition: 'preserve'` or colors-only scope a miss is an observation, not a license to restructure. Campaign Pages keep their own reading sequence.

Like the [task-based choices](../../INSTRUCTION.md#task-based-choices), these are defaults, not templates: a different order that serves the task better is welcome, stated in the design thesis. They hold in any framework and give no sizes. Widths, tiers and pane behavior are the shell's; spacing, radius and type are the theme's. The layout names below are the starter's; an app with its own shell takes its nearest layout.

## One skeleton for every page

- Every page of an app takes one of the shell's layouts and keeps its pane order: sidebar, content, inspector. A page chooses what fills the panes, never where they are.
- Sibling pages of one area take the same layout, so the content column keeps its width as the employee moves between them. A pane with nothing to hold stays empty; do not fill it to look busy, and do not switch layout for one page to hide it.
- Decide the page's type first, then fill its regions in the order below.

## What each pane holds

- **Content answers; the inspector acts.** On a page where no record is picked (an overview, a collection, an item's own page), the inspector holds the page's action module: the one primary action with the few inputs it needs, then at most two or three secondary action rows under a hairline. Nothing in it is needed to understand the content.
- **Test:** cover the inspector. If the content still answers the page's question, the split is right. If it does not, that material belongs in content.
- **A picked record is the other case.** When the task is to pick one item and then read or change it, the page is a list and its detail: the list pane is the narrower one and the detail fills, as the contract's [composition](../../INSTRUCTION.md#composition) rule already says. Do not use an action inspector there.
- **Narrow tiers.** Where the shell shows one view at a time, an inspector that holds only actions must not be the only way to act: the primary action stays visible in the content view, in its title row or in the bottom dock that [Actions](functional-patterns.md#actions) describes. It is still the page's one primary action there and is drawn as primary; moving it does not demote it to a secondary button. The rest of the module stays behind the shell's own switch.

## Page types

Regions are in reading order, top to bottom in content.

| Page type | Its question | Content | Inspector | Starter layout |
| --- | --- | --- | --- | --- |
| Overview | What needs my attention across the product? | One section per area, each a short preview of its collection | Action module | `ContentLayout` |
| Collection | Which of these? | Section heading; filter row; table or list; way to the full set when capped | Action module, or empty | `ContentLayout` |
| Item page | How is this one doing? | Figure with its change; chart; range control; description; facts as label over value; related items | Action module for this item | `ContentLayout` |
| Balance or status page | How much, and what can I do with it? | Figure; progress or state; a few labelled figures in one band; rows that each carry one action; activity | One action | `ContentLayout` |
| Activity | What happened? | Filter row that stays in view; list by date, or the empty state | Empty | `ContentLayout`, or `SimpleLayout` when no sibling page has an inspector |
| Settings | Which setting, then what value? | List pane: groups as rows. Detail: groups with a heading, each row a title, a description, its current value and one trailing action | None: list and detail | `AppShell` |

An item page reached from a collection carries a back control and the item's name in its pane header.

## Sections

A content pane is a stack of sections, not a grid of boxes.

- **One header row per section:** a heading, at most one line of description, and at most one trailing control, which opens the full collection. Every section on a page uses the same header row.
- **The gutter is inside the section.** Text in every section, and the pane header's title, share one left edge. A hairline between sections and a chart may run the pane's full width; text never does.
- **Sections separate by a hairline, groups inside a section by space.** Rows sit directly on the page with no border and no card around them, as [lists before cards](functional-patterns.md#lists-before-cards) says. A filled container is for a thing that is an object in itself (a promotional item, an account summary) and has no border and no shadow.
- **A section previews; the full collection is one step away.** On an overview a section shows a short, fixed number of rows (five at most) and ends in one full-width secondary action that opens the whole collection. Every section of an overview ends in that action, including one whose collection fits in the preview today. It goes to the collection's own page or view; it never expands the section in place. The page stays about two viewports tall at the widest tier; a longer one means a section should be its own page.

## The figure and its chart

- A page that answers "how much" opens with the figure. It is the first thing in content and the largest text on the screen: the largest type role below the display roles, which stay on Campaign Pages. Its change sits directly beneath it, signed, per the [sample figures](../../neon-create/references/new-ui-workflow.md#sample-data-and-figures) rules. Weight separates a row's name from its values; size does not.
- A chart comes straight after the figure it explains, runs the full width of the content pane and keeps one height at every tier. Its range control sits beneath it, inside the gutter.
- Supporting figures are labelled text in one band or a small grid of label over value, not a row of tinted tiles. When a list already carries the totals, add no band, per [one question, first screen](../../neon-create/references/new-ui-workflow.md#one-question-first-screen).

## Filters and narrow tiers

- A filter row belongs to its collection: it sits directly above it and stays in view at the top of its pane while the collection scrolls.
- On narrow tiers a collection changes form, never order or content: a table becomes two-line rows per [tables on narrow screens](../../neon-create/references/new-ui-workflow.md#tables-on-narrow-screens), filter chips stay on one line and scroll sideways, and a row of related items scrolls sideways. The page itself never scrolls sideways.
- An empty collection keeps its filter row and shows the empty state centred in the content pane. It adds no action when the controls above are the way out.

## The menu

The sidebar is a short menu of the destinations an employee moves between. When the destinations outgrow what the narrowest tier's navigation shows, keep the most used and put the rest behind one further destination that lists them, rather than lengthening the menu.
