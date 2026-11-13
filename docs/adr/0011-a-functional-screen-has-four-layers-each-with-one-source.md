# A functional screen has four layers, each with one source

A functional Finnomena screen (Back Office, Product Feature) is decided in four layers, and each layer has one source. When two layers disagree, the earlier one in this list holds.

| Layer | What it decides | Source |
| --- | --- | --- |
| Shell | Navigation, panes and the layout components that supply them | The app's own shell. On the Neon base that is `registry/layout/`, carried over from the CDS starter |
| Values | Color, type sizes and weights, radius, spacing, each component's look | Core, through the Core snapshot and `theme/css/theme.css` ([ADR 0009](0009-neon-matches-core-not-cds.md)) |
| Design language | How a pane reads: ink and white with color kept to content, hierarchy by size and position, regions separated by space, then a hairline, then a container, no shadow on the page | The Design intent section of `skills/INSTRUCTION.md` |
| In-app patterns and components | Composition inside a pane, and components an app composes from Neon items | The agent, per task |

Why: the owner wants functional screens laid out like Coinbase's products and read like Uber's, in Finnomena's colors. ADR 0009 says Neon matches Core, not CDS, which leaves two things a later reader cannot explain from it: why the shell is still the CDS starter's, and where the Design intent ideas come from. The shell stays because it is the part of CDS that is a layout decision, not a look, and Core has no approved web shell to replace it. The design language was drawn from the owner's style notes on products with an ink-and-white interface (Uber, shadcn/ui, Vercel, Airbnb, Bolt), recorded in `research/skill-and-theming-ideas.md`.

## Decisions

- **No value is copied from a reference product.** Uber's Base uses pure black, 0px cards and bold 40px titles; Neon's primary is navy, its card has a 24px radius and its titles are regular weight up to 28px (`research/neon-vs-base-tokens.mjs`). A change to any of these is made in Core and synced, never overridden in Neon.
- **The skills name no reference product.** A model that reads "like Uber" brings Uber's values with it. The contract describes each layer by its content; product names stay in `research/` and in this ADR.
- **The split is an order, not a proportion.** The owner described it as 60% layout and 40% design language. The skills state which layer decides what, and no number.
- **The shell is fixed per screen.** An agent picks one of the shell's layouts and fills its panes. When none fits, it builds in the nearest one and reports the misfit; a change to a layout is a registry change with its own issue. An app with its own shell keeps it.
- **The panes read sidebar, content, inspector, and the sidebar is the menu.** The order is the same in every layout. The sidebar holds the app's destinations; a list of records is content, as a list page that opens a detail page or as a list pane.
- **A new component means an in-app one.** It is composed from Neon items inside the app. The registry still grows only with an approved Core Counterpart (ADR 0009).
- **Containers come last.** Related content is grouped by spacing, then a divider, and takes a container only when the group is a thing the user acts on: an item in a collection, or a card the request asks for.
- **Campaign Pages are outside this.** They take color from an Immersive Theme or a Reference Design and keep the Brand Floor ([ADR 0004](0004-immersive-pages-keep-a-thin-brand-floor.md), [ADR 0005](0005-immersive-pages-start-from-a-guideline-theme.md)).

## Considered Options

- **Match Uber's Base values as well as its language:** rejected; it would put a second value source beside Core and undo ADR 0009.
- **Let the agent redesign the shell per screen:** rejected; screens of one app would stop sharing navigation and panes, and the shell is the part employees recognise across apps.
- **Name the reference products in the skills:** rejected for the reason above.
- **Rebuild the shell from Core now:** deferred until Core has an approved web Navigation and shell.

## Consequences

- A task that fits no layout produces a reported misfit instead of a new layout. The capacity planner eval reported one: `ContentLayout` drew its detail pane left of the main content. That was a defect against the pane order above and was fixed in the registry and the CDS starter.
- A screen may look less like Uber than its language suggests, because radius, title weight and primary color are Core's.
- When Core approves a web shell, this ADR's first row changes and the others stand.
