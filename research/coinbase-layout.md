# Layout principles of Coinbase's signed-in web app

14 November 2026. Research for one question: what layout logic does Coinbase's signed-in web app follow, stated generally enough that Neon's skills could later teach an agent to lay out a new functional page the same way?

Two primary sources only. **Observed** means measured in the live product (`https://www.coinbase.com`, signed in, the user's Chrome, read-only) with `getBoundingClientRect` and `getComputedStyle`, plus screenshots. **Stated** means written in Coinbase Design System's public docs (`https://cds.coinbase.com`, web v9.30.1 on this date). Pixel values are evidence for a principle, not values to copy: [ADR 0011](../docs/adr/0011-a-functional-screen-has-four-layers-each-with-one-source.md) says no value is copied from a reference product, and the skills name none. No colour, copy, icon or image is recorded here, and no account data: figures appear as `<balance>`, `<price>`.

Pages measured: `/home`, `/trade`, `/price/<asset>`, `/transactions`, `/settings/preferences`, `/lend/balance`. Viewport widths: 1510 (the window's own), 1440, 1280, 1279, 1100, 1080, 1060, 1024, 900, 768, 767, 600, 560, 500. See [Limits](#6-limits-of-the-evidence) for what that leaves out, including a true 390px.

## 1. Summary

The app is one fixed shell and one repeated page skeleton. The shell is a left sidebar (the menu) and a sticky top bar (page title left, search and utilities right); the window itself scrolls. Right of the sidebar, almost every page splits 2:1 into a main column and a sticky right rail, and the two columns touch with a hairline between them, with no outer margin and no maximum width seen up to 1510px. The main column is a stack of full-width sections separated by hairlines, each with the same header row and the same inner gutter; lists and tables sit directly on the page, and filled containers are kept for a few tiles and promotional items. The right rail holds the page's one primary action and nothing the main column needs. As the viewport narrows the shell steps down at the documented breakpoints (sidebar, then icon rail, then bottom tab bar) and the rail disappears before the sidebar does: its actions move to a dock fixed to the bottom of the viewport and its supporting content is dropped. Hierarchy comes from four type steps (headline figure, page title, section heading, row text) and from position, not from boxes.

## 2. Principles

Each rule is general; the evidence under it says where it was seen.

### P1. One shell for every page; the page chooses only what goes in its columns

Sidebar, top bar and the two-column content area were identical on all six pages; only the content of the main column and the rail changed. Settings is the one variation, and it reuses the same split mirrored (P4).

- Observed: at 1440, sidebar `[0,0,240,851]`, top bar `[240,0,1200,73]`, content `[240,73,1200,…]` on `/home`, `/trade`, `/price/<asset>`, `/transactions`, `/lend/balance`, `/settings/preferences`.
- Stated: the docs present Sidebar and NavigationBar as the application's navigation components; NavigationBar is "a universal header component for navigation and wayfinding" (<https://cds.coinbase.com/components/navigation/NavigationBar/>, <https://cds.coinbase.com/components/navigation/Sidebar/>). The docs do not state how the two compose with page content.

### P2. The window scrolls; chrome and the rail stick

Nothing scrolls inside a pane. The document scrolls, the sidebar is fixed, the top bar is `position: sticky; top: 0`, and the right rail's content is `position: sticky; top: 73px`, so it stays in view while the main column scrolls under the top bar. A filter bar that belongs to a list sticks directly below the top bar.

- Observed: `body` overflow-y `scroll`, no inner scroll container on any page; sidebar `position: fixed` 240×851; top bar sticky 73px (72 + 1px bottom border); rail inner `sticky` at `top: 73px`; `/transactions` filter bar sticky at `top: 73px`, 90px high, padding 24/32/16.
- Stated: not covered. PageHeader's example uses `position="sticky"` with `top="0"` without explaining it (<https://cds.coinbase.com/components/navigation/PageHeader/>).

### P3. Content is a proportional 2:1 split, edge to edge, with no centred max width

The area right of the sidebar divides into a main column and a right rail at a 2:1 ratio that holds at every width where both show. There is no outer margin: sections run from the sidebar's edge to the rail's hairline, and the gutter lives inside each section (P6).

- Observed: main + rail = 847+423 at 1510, 800+400 at 1440, 693+347 at 1280, 795+397 at 1279 (icon rail), 675+338 at 1100, 662+331 at 1080. Both are flex items with `flex: 1 1 auto`; computed `max-width: none`. The rail has a 1px hairline on its left.
- Stated: Grid documents custom columns with `fr` ratios and gives "`2fr 1fr`" as its example of a 2/3 and 1/3 split (<https://cds.coinbase.com/components/layout/Grid/>). No page-level max width is stated anywhere read.

### P4. A list-then-detail page mirrors the split: 1:2, list on the left

Where the task is to pick one item from a short list and then read or change it (settings), the same two columns appear in the opposite proportion: a sticky list pane on the left, the detail on the right, with the hairline on the list's right edge.

- Observed: `/settings/preferences` at 1440: list 400, detail 800; at 1100: 338 and 675. List rows are 72px high and full-bleed in the pane; the selected row has a filled background and each row ends in a chevron. The list pane is sticky at `top: 73px`.
- Stated: not covered.

### P5. The right rail holds the action, never the content

On content-weighted pages the rail carried the same thing everywhere: the page's primary action module (a mode selector, a short prompt, one full-width primary button) and, below a hairline, two or three secondary action rows. Nothing in the rail was needed to understand the main column, which is why it can be removed on narrow widths (P9). On a page with nothing to act on (`/transactions`, empty) the rail column was still reserved and left empty, so the main column keeps the same width from page to page.

- Observed: rail content starts 32px in from its hairline (`x = 1072` at 1440). Primary button 56px high, pill, full width of the rail (the only 56px button on each page). `/lend/balance` rail held a single action row. `/transactions`: second column present, 400 wide, no visible content.
- Stated: not covered.

### P6. The main column is a stack of full-bleed sections, each with the same header row

A page is sections stacked top to bottom. A section is: a header row (heading, optional one-line description, optional trailing control that opens the full collection), then its body, then bottom padding, then a hairline across the whole column. The gutter is inside the section, so hairlines and charts can run edge to edge while text aligns to one left edge.

- Observed: section header row padding 24px top and bottom, 32px left and right; section bottom padding 32px; `border-bottom: 1px` on each section wrapper; text left edge `x = 272` (240 + 32) on every page at 1440. Trailing control is a 40px circular button. Gutter is 32px from 768 up and 24px below 768.
- Stated: SectionHeader has `title`, `description` (truncated after two lines), `start`, `icon`, `balance` and `end` slots, laid out space-between (<https://cds.coinbase.com/components/navigation/SectionHeader/>). Spacing values are on the theme scale 0, 2, 4, 6, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80 (<https://cds.coinbase.com/getting-started/theming/>); every gap and padding measured (4, 8, 12, 16, 24, 32, 40) is a step of it.

### P7. Space, then a hairline, then a container; lists and tables sit on the page

Rows have no borders and no card around them. Sections are separated by a hairline, groups inside a section by space. A filled container appears only for a thing that is an object in itself: a stat tile, a promotional item, an account summary. Containers have a fill, no border and no shadow.

- Observed: table rows `border-bottom: 0`; list rows 60px (`/home`) and 64px (`/trade`) high, table header row 36px; whole row is the click target. Stat tiles on `/lend/balance`: two across, 12px apart, radius 24, padding 16, filled, no border, `box-shadow: none`. Settings summary container radius 12. No shadow on any on-page element measured.
- Stated: ListCell's row is five columns, "Media, Title & description, Intermediary, End, Accessory", and new work should "prefer `spacingVariant=\"condensed\"`" (<https://cds.coinbase.com/components/data-display/ListCell/>). Radius scale 0, 4, 8, 12, 16, 24, 32, 40, 48, 56 and a pill value (theming page above).

### P8. A section previews; the full collection is one step away

Sections on overview pages show a short, fixed number of rows (2 to 5) and end with one full-width secondary button that opens the whole collection, repeated by the trailing control in the section header. The page stays scannable and short, and its height is predictable.

- Observed: `/home` sections show 1 to 2 rows then a full-width 40px pill button; `/trade` shows 5 table rows then the same button. Document height at 1440 was 1063 to 1652px across all pages: at most two viewports.
- Stated: not covered.

### P9. One primary action per view, and it follows the viewport

Each view has exactly one primary-styled button. At wide widths it sits in the rail. When the rail goes, the same action moves to a dock fixed to the bottom of the viewport, with at most one secondary beside it. Row actions and section actions are secondary or text-weight, however frequent.

- Observed: one 56px primary per page at 1440, in the rail. At 768 to 1060: fixed bottom dock, two 56px buttons right-aligned (secondary, then primary). Below 768: the two buttons are 40px high, side by side at equal width, 24px side padding, directly above the bottom tab bar; on `/lend/balance` the dock is a single full-width primary. Per-row actions are 40px text-weight or neutral pill buttons.
- Stated: not covered on the pages read.

### P10. The shell steps down at fixed breakpoints; the rail leaves before the sidebar

Three shell tiers match the documented breakpoints exactly. The right rail is dropped at a width inside the tablet tier, earlier than the sidebar collapses to nothing, and search shrinks to an icon in between.

- Observed: sidebar 240 with labels at 1280 and up; an 87px icon rail (58×58 items) from 768 to 1279; hidden at 767 and below, replaced by a bottom tab bar of three destinations plus a menu button in the top bar that opens a full-screen drawer with the rest. Right rail present at 1080, gone at 1060. Search field 360×42 at 1024, a 42px icon button at 900.
- Stated: "phone: `(max-width: 767px)`, tablet: `(min-width: 768px) and (max-width: 1279px)`, desktop: `(min-width: 1280px)`", not customisable (<https://cds.coinbase.com/getting-started/styling/>). Sidebar `autoCollapse` collapses "at or below the tablet breakpoint (768px)"; collapsed shows "only icons … with tooltips for labels" (Sidebar page). NavigationBar's examples collapse search to an icon button on mobile (NavigationBar page). The rail's 1061 to 1080 threshold is in no doc read.

### P11. The sidebar is a short menu; overflow goes to a second level, not a longer list

The sidebar lists five destinations and one "more" item. "More" opens a second panel beside the sidebar over a scrim; on phone the same destinations are in the drawer. The sidebar's foot holds one mode switch. Records never appear in the sidebar.

- Observed: 6 items, each 211×58 at 240 wide, pill-shaped hit area, 4px apart, 16px pane padding; the current item is filled. "More" panel: fixed, 320 wide at `x = 240`, full height, with a scrim over the content area, a close button and one small group label. Phone drawer: full-screen, same items as a plain list, footer links at the bottom.
- Stated: "Use the Default variant on standard consumer-facing surfaces"; Condensed is for surfaces where "navigation space is minimized to focus on core tasks"; extra items move into `SidebarMoreMenu`; `renderEnd` places content at the bottom (Sidebar page).

### P12. The top bar names the page and holds only global tools

Left: the page title, preceded by a back button on a detail page and followed by at most one item-level toggle. Right: search, then a row of icon buttons. No page-specific actions live there. On phone the top bar keeps the tools, swaps the title for the menu button and logo, and the title becomes the first line of the content.

- Observed: top bar 72px + 1px hairline, padding 8/32 (8/16 below 768); title at `x = 272`, aligned with section text; search 360×42; four 40 to 42px icon buttons 8px apart. Detail page: back button, title, one toggle. Below 768: title rendered in content at 28/36/600, top bar shows menu button and logo.
- Stated: NavigationBar slots are `start` (e.g. a conditional back button), children (title or compact search), `end` (trailing actions grouped with `gap={1}`) and `bottom` ("use the `bottom` prop to add tab navigation") (NavigationBar page).

### P13. Four type steps carry the hierarchy; the figure is the largest thing on the page

A page that answers "how much" opens with the figure, larger than the page title and lighter in weight, with its change directly beneath. Then section headings, then rows. Weight separates a row's name from its values; size does not.

- Observed: headline figure 40/40, weight 400 (`/price/<asset>`, `/lend/balance`); page title 28/36, weight 600; section heading 20/28, weight 600; row title 16/24, weight 600; row values and body 16/24, weight 400; supporting text 14/20; smallest 13/16. Table header cells 16px. One `h1` per page.
- Stated: theme type scale: display3 40/48, title1 28/36, title3 20/28, headline and body 16/24, label 14/20, caption and legal 13/16 (theming page).

### P14. A chart is full-bleed in its column and comes straight after the figure it explains

On a detail page the order is figure, change, chart, range selector. The chart runs the full width of the main column with no gutter, at a fixed height that does not change with the viewport; its range selector sits below it inside the gutter.

- Observed: chart `[240,201,799,268]` at 1440 (column is 799 wide) and `[0,233,500,268]` at 500: same 268px height, zero side inset at both.
- Stated: not covered on the pages read.

### P15. Narrow widths change the form of a collection, not its content order

A table keeps its rows and its order but becomes a two-line list: name and one secondary metric on the left, the main figure and its change right-aligned, header row gone. Filter chips stay on one line and scroll horizontally. Related-item cards scroll horizontally at every width, with previous and next buttons. The page never scrolls sideways.

- Observed: `/trade` at 900: 7-column table, 813 wide, row 64. Below 768: no `table` element; two-line rows; chip row scrolls with a leading scroll button. `scrollWidth` equalled viewport width at every width measured. A table column of inline charts on `/home` was dropped by 900.
- Stated: ListCell's `priority` prop "controls which regions resist shrinking and truncation when horizontal space is limited" (ListCell page). Grid's `templateColumns` takes no breakpoint object: use `useBreakpoints` to switch configurations (Grid page).

### P16. Empty is centred in the main column and keeps the page's controls

An empty collection keeps its filter bar and shows one centred block in the main column: illustration, a heading-sized line, one supporting line. It adds no action when the controls above are the way out. An empty action module in the rail uses the same order, left-aligned, and keeps its primary button.

- Observed: `/transactions`: illustration 240×120, title 20/28 weight 600, description 16/24, all centred in the 800 column, starting about 105px below the filter bar; no button. Rail empty state on `/home`: heading 28/36 weight 600, description, illustration, then the primary button.
- Stated: not covered on the pages read.

## 3. Page anatomy by type

Regions in reading order. "Rail" is the right column at 1080 and up.

| Page type | Seen at | Main column, top to bottom | Rail |
| --- | --- | --- | --- |
| Overview | `/home` | Section per product area: header (heading, optional one-line description, trailing open-all control); 1 to 2 preview rows (media, name and sub-label, figure, change, row action); full-width secondary button to the full collection | Primary action module; hairline; 2 secondary action rows |
| Collection | `/trade` | Section header; row of filter chips (42px pills, first is a filter control); table: 36px header, 64px rows, columns name, three figures, change, row action, toggle; full-width "all" button; next section as a list of filled rows | Same module as Overview |
| Item detail | `/price/<asset>` | Top bar: back, title, toggle. Then figure (40px) with change beneath and a small meta block at the right; full-bleed chart (268px); range selector; text section with clamp and "read more"; stats as a 3-column grid of label over value; horizontal carousel of related items; disclaimer; footer | Same module |
| Product dashboard | `/lend/balance` | Figure with a unit toggle at the right; progress bar with caption; 2 stat tiles; 2 product rows with trailing action; section with one promotional container; section of settings rows with switches; activity section; info rows | One action row |
| Activity | `/transactions` | Sticky filter bar (chips); list, or the centred empty block | Reserved, empty |
| Settings | `/settings/…` | Left pane (1/3): summary container, then 72px navigation rows with chevrons. Right pane (2/3): groups with a 20px heading, each row a title, description, status line and one trailing secondary button; hairline between groups; 40px top padding | None: the split is list and detail |

## 4. Breakpoints

Observed thresholds; the tier names are CDS's (stated on the styling page).

| Viewport | CDS tier | Navigation | Top bar | Content | Primary action | Gutter |
| --- | --- | --- | --- | --- | --- | --- |
| 1280 and up | desktop | Sidebar 240, icon and label | Title, 360px search, icon buttons | Main and rail 2:1 (settings 1:2) | In the rail, 56px | 32 |
| 1080 to 1279 | tablet | Icon rail 87 | Same | Main and rail 2:1 | In the rail | 32 |
| 1061 to 1079 | tablet | Icon rail 87 | Same | Threshold not pinned: rail present at 1080, absent at 1060 | | 32 |
| 1024 to 1060 | tablet | Icon rail 87 | Same | One column; settings shows the detail pane only | Fixed bottom dock, right-aligned, 56px | 32 |
| 768 to about 1000 | tablet | Icon rail 87 | Search becomes an icon (icon at 900, field at 1024) | One column | Same dock | 32 |
| 500 to 767 | phone | Bottom tab bar, 3 destinations; menu button opens a full-screen drawer | Menu button, logo, icon buttons; padding 8/16; title moves into content | One column; table becomes two-line list; chips scroll | Dock above the tab bar, 40px, equal-width pair or one full-width | 24 |
| Below 500 | phone | Not measured | | | | |

## 5. Mapping to Neon

Sources read: `skills/INSTRUCTION.md`, `skills/neon-audit/references/functional-patterns.md`, `docs/adr/0011-…md`, `docs/design/starter-workspace-shell.md`, `registry/layout/` (`layoutPanes.ts`, `layout.css`), `theme/cds/breakpoints.config.ts`.

### Already covered

| Principle | Where Neon says it |
| --- | --- |
| P1 fixed shell | INSTRUCTION "Fixed, and yours to design": the shell is not edited for one screen; ADR 0011 "The shell is fixed per screen" |
| P11 sidebar is the menu, records are content | INSTRUCTION Composition; ADR 0011 "the sidebar is the menu" |
| Pane order sidebar, content, inspector (P3, P5) | ADR 0011; `ContentLayout` reads sidebar, content, inspector |
| P4 list and detail chosen from the start | INSTRUCTION Composition and Task-based choices; `AppShell` (Detailed Layout) has a fixed list pane of 360 to 400 and a filling detail, which at 1440 gives the same 400 the reference shows |
| P7 space, hairline, container; no shadow on the page; lists before cards | INSTRUCTION Design intent; functional-patterns "Lists before cards", "Surfaces, elevation and radius" |
| P9 one primary; dock on narrow tiers, above the tab bar | INSTRUCTION "One next step", "Feature states and narrow screens"; functional-patterns Actions; Core hierarchy and Button dock |
| P10 sidebar, icon rail, bottom navigation tiers | `docs/design/starter-workspace-shell.md`: bottom navigation below 500, 64px rail to 1279, 240 from 1280 |
| P13 hierarchy by size and position; one h1 | INSTRUCTION Design intent; functional-patterns "Typography in use" |
| P16 empty state | functional-patterns points to Core's Empty state |

### Conflicts

1. **Scroll model (P2).** Neon's `AppShell` and `ContentLayout` keep "the header above each pane's independently scrolling body". The reference scrolls the window and sticks the top bar, the rail and a filter bar. Only `ImmersiveLayout` scrolls with the window in Neon.
2. **How the content area divides (P3).** `ContentLayout` gives the inspector a fixed width per tier (360, 400, 560) and lets content fill, capped at 980 and centred at `max`. The reference divides proportionally (2:1) with no cap seen. They agree only at 1440.
3. **What happens to the right pane when narrow (P5, P9).** Neon, below 988: content and inspector "switch as separate views with a back control", and "no right-hand overlay or drawer was added". The reference removes the rail and docks its actions. Neon's rule suits an inspector that holds a record; the reference's rail never does.
4. **Display roles (P13).** functional-patterns: "Display roles belong to Campaign Pages, not functional screens". The reference's headline figure is at its display3 size (40px). ADR 0011 also notes Neon's titles are regular weight up to 28px, where the reference uses weight 600; that is a Core value and not for Neon to change.
5. **Tier boundaries and chrome sizes (P10, P12).** Bottom navigation starts below 500 in Neon and below 768 in the reference; rail 64 against 87; header 64 against 72; gutters 16 and 24 against 24 and 32. Neon's numbers came from Finnomena's own order-history page and its Figma frames, and functional-patterns says to "name layouts by the app's breakpoint tiers, not by pixel values copied from another system", so these are differences to leave alone, not defects.
6. **Containers (P7).** No conflict in rule, but the reference's settings rows each carry a trailing secondary button, which agrees with Neon's "row actions are secondary or tertiary" and is worth an example.

### Missing from Neon

1. **Page anatomy by page type.** INSTRUCTION's Task-based choices pick a composition per task (table, list and detail, form, filter) but give no reading order for a whole page. Section 3's five types (overview, collection, item detail, product dashboard, activity) have no counterpart.
2. **What the inspector is for on a content-weighted page.** Nothing says it holds the page's action and nothing the content depends on (P5), so nothing lets an agent decide it may be dropped or docked.
3. **Section anatomy.** No rule for a section's header row (heading, one-line description, trailing open-all control), for the gutter living inside the section so hairlines and charts can be full-bleed (P6), or for preview-then-all (P8).
4. **Headline figure.** No rule that a page answering "how much" opens with the figure, largest on the page, with its change beneath (P13), nor a type role for it on functional screens.
5. **Chart placement.** Nothing on a chart's position after its figure, full-bleed width, fixed height or range selector (P14).
6. **Stat tiles and key-value grids.** No pattern for a two-across tile row or a 3-column label-over-value grid, nor for when a tile is allowed under "containers come last".
7. **Sticky sub-header.** Task-based choices says "toolbar near results"; nothing says it stays in view (P2).
8. **Collections on narrow tiers.** "Keep key columns/actions reachable on narrow screens" is the only line; nothing describes a table becoming a two-line list, which column pairs with which, or chips scrolling on one line (P15).
9. **Navigation overflow.** No rule for how many destinations a sidebar or tab bar shows and where the rest go (P11).
10. **Top bar contents.** The starter has `contentHeader` and `contentActions` slots; nothing says the bar holds title and global tools only, a back control on a detail page, and that the title moves into content on the narrowest tier (P12).
11. **Reserved empty rail.** Nothing says a page with no action keeps the same column width as its neighbours (P5).

## 6. Limits of the evidence

- **No 390px measurement.** Chrome would not make the window narrower than 500px (one resize to 500 produced a 606px viewport). The phone tier is measured at 500 to 767 only. Device emulation was not used.
- **Nothing wider than 1510px.** Whether the content area caps or centres on a large display is unknown; `max-width: none` at 1510 is all that was seen.
- **Two thresholds are ranges.** Rail: between 1061 and 1080. Search collapse: between 901 and 1024. The app sets both in script, not CSS, so the stylesheet's media queries did not settle them.
- **The account shows no holdings.** `/assets` redirected to `/home`, the sidebar had no portfolio item, `/home` showed no balance or portfolio chart, and `/transactions` was empty. So a populated portfolio page, a populated transaction list (row height, grouping by date, pagination or infinite scroll) and a home page with a balance hero are unverified. The headline-figure rule rests on the item detail and lending pages.
- **Root page titles were measured on the `h1` wrapper** (20px, weight 500, 36px box). The 28/36 weight 600 title was measured directly only on the detail page and on phone. The 36px box suggests the same text style on root pages; not confirmed.
- **Loading.** Only a full-page spinner was seen, when the shell re-rendered across a tier change. No skeleton or per-section placeholder was observed.
- **Settings between 768 and 1079.** The list pane was absent and the detail pane showed; no control back to the list was visible in the 900px screenshot. On phone a back arrow sat above the content. How the list is reached at tablet widths was not explored.
- **No flow was opened.** Buy, sell, send, convert, deposit, transfer, "Update" and "Start" were never clicked, so modals, trays, forms, confirmation and error states are unobserved. The only clicks were the sidebar's "more" item, the phone menu button and its close button.
- **`/agents` and the "Advanced" mode were not visited.** CDS says Advanced uses the Condensed sidebar; not observed.
- **CDS docs state little about pages.** Breakpoints, the spacing, radius and type scales, and component slots are stated. Sidebar width, top bar height, the 2:1 split, sticky behaviour, the rail's content and the bottom dock are observed only. The pages for Divider, PageFooter, Tray, Modal, Carousel and `useBreakpoints` were not read.
- **One locale, one theme, one day.** Light theme, English, one account type and region. The app renders differently by region and feature flags.
- **No page carried instructions addressed to an agent**; nothing was ignored on that ground.
