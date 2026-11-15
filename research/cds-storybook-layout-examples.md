# CDS Storybook "Examples / Layouts": what it shows and what Neon can take

> 2026-11-15 · Sources: the CDS Storybook at `https://cds-storybook.coinbase.com` (Storybook 9.1.17, `@storybook/react-vite`; `project.json` `generatedAt` 2026-06-15 21:24 UTC, `index.json` last-modified 2026-06-15 21:43 UTC, 821 entries), read through `index.json` and the story iframe, and rendered in the desktop app's built-in browser at emulated 1440×900, 1000×900 and 375×812. `coinbase/cds` at `fdb195e` (master, 2026-11-13), `@coinbase/cds-web` 9.30.1 there. Master when the Storybook was built was `ee3fd8c` (2026-06-15 21:11 UTC). Ours: this repository at `31a8478`.

The owner pointed at the story `examples-layouts--examples` and asked how Neon could use it. Sections 1 to 4 are facts with citations. Opinion appears only in [section 5](#5-recommendations-opinion). The note is read-only: nothing else was changed and no issue was filed. As [ADR 0011](../docs/adr/0011-a-functional-screen-has-four-layers-each-with-one-source.md) requires, pixel values here are evidence, not values to copy, and no Coinbase colour, copy or image is reproduced. The story's prose is paraphrased.

It adds to [coinbase-layout.md](coinbase-layout.md), which measured Coinbase's signed-in app. It does not restate that note.

**Citation keys.**
- `cds <path>:<line>` is a file in `coinbase/cds` at `fdb195e72ef5`. For example, `cds packages/web/src/layout/__stories__/Layouts.stories.tsx:325` is <https://github.com/coinbase/cds/blob/fdb195e72ef55c0a34a48dfd8c70539b5ea9fb79/packages/web/src/layout/__stories__/Layouts.stories.tsx#L325>. `Layouts.stories.tsx` was last changed in `0f20f9d` (2025-09-18) and `Grid.tsx` in `fd656d2` (2026-05-21). Both are before the Storybook build, so the deployed story is the code cited. `FullscreenModalLayout.stories.tsx` changed after the build (`dd46d6e`, 2026-07-31). That commit removed only a 9-line `parameters.a11y` block (lines 17–25 at `ee3fd8c`). The story bodies are identical, and line numbers here are at `fdb195e`, 9 lower than the deployed file.
- `L:<line>` is short for `cds packages/web/src/layout/__stories__/Layouts.stories.tsx:<line>`.
- `sb index` is `https://cds-storybook.coinbase.com/index.json`. `sb render <width>` is a measurement in the rendered iframe (`iframe.html?id=examples-layouts--examples&viewMode=story`) with `getBoundingClientRect`, `getComputedStyle` and `scrollWidth`.
- `docs Grid:<line>` is `cds apps/docs/docs/components/layout/Grid/_webExamples.mdx:<line>`, the source of <https://cds.coinbase.com/components/layout/Grid/>.

## Could not access

| Gap | Why | Effect |
|---|---|---|
| Claude in Chrome | The extension was not connected in this session. | The story was rendered in the desktop app's built-in browser instead, read-only, signed in to nothing. |
| A true 375px layout viewport | At 375×812 emulation the story's own content was wider than the screen, so the page's layout viewport grew to 898px (`innerWidth` 898). | Page-level widths at 375 are not cited. Container `scrollWidth` against container width is cited, because each container was 375 wide. |
| The Storybook's exact source commit | The Storybook publishes no commit SHA. | The build time (2026-06-15) is matched to master at `ee3fd8c`. The cited files are unchanged, or changed only as noted above, between that commit and `fdb195e`. |
| cds.coinbase.com rendered pages | Not opened. The Grid page's text was read from its MDX source in the repository instead. | Docs facts cite the MDX at `fdb195e`, which may be newer than the live docs page. |

---

## 1. What exists under "Examples"

1. **One story.** `sb index` lists 821 entries. Exactly one has a title under `Examples/`: `examples-layouts--examples`, title `Examples/Layouts`, name `Examples`, import path `packages/web/src/layout/__stories__/Layouts.stories.tsx`, tags `dev` and `test`. There are no other `Examples/*` stories. The other top-level groups are Components (790), Illustrations (16), Icons (10), Hooks (2), Accessibility (1) and Colors (1).
2. **It is a tutorial on layout primitives, not a gallery of page layouts.** The story composes HStack, VStack, Grid, GridColumn, Divider, Text and Link and nothing else (`L:1-10`). It has no shell, sidebar, navigation, pane, page header or inspector, and no product content: every cell is a numbered grey box or lorem ipsum (`L:12-26`; `cds packages/web/src/layout/__stories__/LoremIpsum.tsx`). Its "Holy Grail Layout" is three boxes, `200px 1fr 200px`, inside a bordered strip (`L:122-142`, `L:479`).
3. **Its neighbours.** The stories nearest to it are in other groups:
   - `Components/Grid` → `Grid Examples` (`cds packages/web/src/layout/__stories__/Grid.stories.tsx:151`). It has responsive columns, `templateColumns`, a `ul` grid, an implicit grid and a clamped implicit grid.
   - `Components/Responsive Props` has 7 stories (`…/Responsive.stories.tsx`): Box, hide on mobile, stacks, card, cells, table and typography, each driven by `{phone, tablet, desktop}` props.
   - `Hooks/useBreakpoints` and `Hooks/useMediaQuery`.
   - `Components/FullscreenModalLayout` has 5 stories. This is the only Storybook entry that composes panes: header, left, centre and right panels, and top and bottom bands. See section 3.

## 2. The "Examples" story, section by section

The story is one function, `Examples` (`L:325-616`), with three headed parts. Each example is an `Example` wrapper (an h3 title, a description, then the layout) (`L:28-40`). Every example strip shares `borderColor: 'bgLine'`, `borderWidth: 100`, `padding: 1`, `gap: 1` (`L:42-50`), which renders as a 1px border, 8px padding and 8px gap (`sb render 1440`). Each cell is an `Item`: an HStack with fill, centred content, `minWidth="100px"` and `padding={2}` (16px) (`L:12-26`).

### 2.1 Explicit layouts, Flexbox (`L:334-387`)

| Example | Code | At 1440 (`sb render 1440`) | At 375 (`sb render 375`) |
|---|---|---|---|
| HStack with no props | 5 Items in an HStack (`L:52-64`) | five 100px cells | no wrap; the five cells run past the 375 strip |
| Stretch/grow equal columns | each Item `flexGrow={1}` (`L:94-106`) | five cells of about 278 | the same 100px cells; `minWidth` stops them shrinking |
| Ratio based column layout | 3 Items, `flexGrow={idx}` = 0, 1, 2, `flexWrap="wrap"` (`L:108-120`) | 100, 449, 857 (the first has grow 0 and stays at its minimum) | 100, 100, 141 |
| The Holy Grail Layout | `flexBasis="200px"`, `flexGrow={1}`, `flexBasis="200px"`, wrap (`L:122-142`) | 200, 1006, 200 | the third box wraps to a second line |
| Stacks with gaps | `HStack bordered gap={1}` and `VStack bordered gap={1}` (`L:66-92`, `L:383-386`) | row of 100s; column of full-width cells | the row overflows |

### 2.2 Explicit layouts, Grid (`L:389-486`)

The text says that a Grid takes its column sizes once, on the parent, rather than as styles on each child (`L:392-398`).

| Example | Code | 1440 | 1000 | 375 |
|---|---|---|---|---|
| Grid with no props | `<Grid>` (`L:215-230`, `L:410`) | one 1422 column | one column | one column |
| Equal columns | `columns={5}` → `repeat(5, minmax(0, 1fr))` (`L:439`; `cds packages/web/src/layout/Grid.tsx:83`) | 5 × 278 | 5 × 190 | 5 × 65 tracks; content `scrollWidth` 400 in a 375 box |
| Responsive equal columns | `gridTemplateColumns={{ phone: 'repeat(1, 1fr)', tablet: 'repeat(3, 1fr)', desktop: 'repeat(5, 1fr)' }}` (`L:450-456`) | 5 columns | 3 columns | 1 column |
| Ratio based column layout | `templateColumns="1fr 2fr 3fr"` (`L:469`) | 234, 469, 703 | 161, 322, 483 | 100, 100, 141 (cells' 100px minimum wins) |
| The Holy Grail Layout | `templateColumns="200px 1fr 200px"` (`L:479`) | 200, 1006, 200 | 200, 566, 200 | `scrollWidth` 524 in 375 |
| Twelve column layout | `columns={12}` (`L:246-258`) | 12 × 111 | 12 × 74.5 tracks, `scrollWidth` 1016 in 1000 | `scrollWidth` 443 in 375 |
| Full bleed layout | `columns={12}` with one `GridColumn colSpan={12}` (`L:260-270`) | the child spans 1422 | | |

The Equal columns example lists two tradeoffs (`L:418-434`). Explicit columns do not wrap, and the content overflows when the viewport narrows. The tracks are `minmax(0, 1fr)`, whose minimum is 0, not `min-content`. The measurements above show both: Equal columns at 375 and Twelve column at 1000 overflow their strip.

### 2.3 Implicit layouts (`L:487-612`)

The story describes these layouts as ones where the content shapes the layout, useful when the content's size is unknown or varies (`L:492-495`).

| Example | Code | Behaviour measured |
|---|---|---|
| Implicit Flexbox layout | 12 Items alternating `flexBasis` 100px and 200px, `flexWrap="wrap"` (`L:144-160`) | wraps by content; each row's column sizes differ |
| Implicit layout with inferred column sizes | wrap with mixed text and two lorem ipsum Items (`L:162-213`) | wraps per item; the lorem items take a full row |
| Implicit Grid layout | `columnMin="100px" columnMax="1fr"` → `repeat(auto-fill, minmax(100px, 1fr))` (`L:232-244`; `Grid.tsx:75-80`) | 13 tracks of 102 for 12 children at 1440 (`auto-fill` keeps an empty track); 9 tracks at 1000; 3 tracks of 114 at 375; rows wrap with the same 8px gap |
| Implicit Grid with inferred column sizes | `columnMin="max-content" columnMax="300px"` (`L:272-323`) | tracks `100px 889px 889px 100px` at 1440: the strip's `scrollWidth` is 2010 and **the whole document becomes 2010 wide**; 1269 at 1000 |

The implicit-grid tradeoffs (`L:564-583`), paraphrased:
- Rows wrap, with the same gap as columns.
- The layout suits an unknown number of children of a known size.
- Columns cannot differ in size, and a child cannot span columns.
- Track sizes are computed from all children, so they carry from row to row.

The last example's text warns that `max-content` text will not wrap and that a `columnMax` below the minimum is ignored (`L:593-604`). The render confirms it: the page itself scrolls sideways.

**One stale claim.** The text says Flexbox has no row gap, so wrapped items may look wrong (`L:512-515`). The rendered wrapping HStack has an 8px row gap: rows 64px apart for 56px items (`sb render 1440`). CSS `gap` on flex containers has shipped in every evergreen browser for years.

### 2.4 How it is coded

- **Grid is a Box with three column modes** (`Grid.tsx:11-48`, `:60-100`):
  - `columns` (an integer) → `repeat(n, minmax(0, 1fr))`.
  - `templateColumns` (a string) → passed through.
  - `columnMin` plus optional `columnMax` (default `1fr`) → `repeat(auto-fill, minmax(min, max))`. Implicit mode applies only when neither of the first two is set (`:75`).
  - `rows` → `repeat(n, minmax(0, 1fr))` (`:93-95`).
- **GridColumn** turns `colSpan` into `<colStart> / span <colSpan>`, with `colStart` defaulting to `auto` (`cds packages/web/src/layout/GridColumn.tsx:81-84`).
- **Responsive values are a style-prop feature, not a Grid feature.** Every Box style prop takes `T | { base?, phone?, tablet?, desktop? }` (`cds packages/web/src/styles/styleProps.ts:153-161`), `gridTemplateColumns` included (`:117`). Grid's own `templateColumns` is a plain string (`Grid.tsx:27`), and the docs say it takes no object, so the docs point to `useBreakpoints` to switch configurations (`docs Grid:79`). The implicit mode does not use the responsive config; it wraps by itself (`docs Grid:85`). The story's responsive example works because it sets the Box prop `gridTemplateColumns`, not `templateColumns`.
- **Three tiers only.** `phone` is `max-width: 767px`, `tablet` is 768–1279 and `desktop` is from 1280 (`cds packages/web/src/styles/media.ts:11-22`). Finer named breakpoints exist (560, 1024, 1440, 1600; `media.ts:1-9`), but the responsive props take only the three keys plus `base`.
- **Docs inconsistency.** The Grid docs say to pass `2fr 1fr` "to `columns`" (`docs Grid:40`), but `columns` is a number. The example beside it uses `templateColumns`.

## 3. The nearest pane composition: `Components/FullscreenModalLayout`

`FullscreenModalLayout` is an overlay, not a page shell. It is a portal wrapper with a scrim, an enter and exit motion, a focus trap and Escape-to-close, and it pins one child to the full viewport (`cds packages/web/src/overlays/modal/FullscreenModalLayout.tsx:46-52`, `:90-126`). The panes are drawn by each story, not by the component.

| Story (`cds packages/web/src/overlays/__stories__/FullscreenModalLayout.stories.tsx`) | Regions |
|---|---|
| Basic (Center Panel) (`:28-74`) | Header row (logo box 80 wide, title, close icon button), with `borderedBottom`, `paddingX={4}` and `paddingY={2}` (`:34-47`); one centre panel, `overflow="auto"` (`:51`) |
| Two Column (Left + Center) (`:76-129`) | Header; left panel `width={360}` with its own scroll (`:100`); centre fills with its own scroll (`:105`) |
| Three Column (`:131-189`) | Header; left 360 (`:155`), centre fills (`:160`), right 360 (`:167`), each scrolling on its own |
| All Panels (`:191-261`) | Header; a top band, labelled as the place for wayfinding or progress; left, centre and right as above (`:221`, `:226`, `:233`); a bottom band with `borderedTop`, labelled as the place for a footer or actions |
| Example (`:263-415`) | Header; a tag row; left and right 360 panels with `alignSelf="start"` and `flexShrink={0}` around a filling centre (`:366-377`); a right-aligned Cancel and OK button group in a `borderedTop` footer. Here the whole body scrolls as one (`:344`), not each panel |

None of these stories changes with the viewport: panel widths are fixed at 360, and nothing collapses or stacks.

## 4. Comparison

### 4.1 With Neon's `registry/layout/`

| | Storybook | Neon (`registry/layout/`) |
|---|---|---|
| What it is | Primitives (HStack, VStack, Grid, GridColumn) shown in isolation; no app layout | Five shell layouts with a sidebar, bottom navigation and named panes (`AppShell`, `ContentLayout`, `SimpleLayout`, `MultiColumnLayout`, `ImmersiveLayout`) |
| Layouts in both | None as layouts. The Grid "Holy Grail" (`200px 1fr 200px`) has the same shape as sidebar, content and inspector, but has no navigation, tiers or pane behaviour | |
| Storybook only | Implicit grids of unknown count (`auto-fill`), 12-column grid with spans, ratio splits (`1fr 2fr 3fr`), a full-screen task overlay with left, centre and right panels and top and bottom bands | |
| Neon only | | Tiered shell: 7 tiers (sm 320–499 … max 1920+, `theme/cds/breakpoints.config.ts`), sidebar 0/64/240 (`layout.css:33-96`), one view at a time with a back control below lg (`ResponsivePanes.tsx`), a board of 400px columns (`MultiColumnLayout.tsx:31`), immersive content capped at 1440 at max (`ImmersiveLayout.tsx:45`) |
| Pane order | Holy Grail reads navigation, main, sidebar; the modal reads left, centre, right | Sidebar, content, inspector (ADR 0011) |
| Breakpoints | 3 tiers, 768 and 1280 (`media.ts:11-22`) | 7 tiers at 500, 988, 1080, 1272, 1440 and 1920; workspace sidebar steps at 500 and 1280 |
| Scroll | Story: the window. Modal stories: each panel scrolls on its own (`:100`, `:105`), except Example, whose body scrolls as one | Each pane scrolls on its own under a persistent 64px header (`ResponsivePanes.tsx:96-127`); only a themed `ImmersiveLayout` scrolls the window (`ImmersiveLayout.tsx:66-67`) |
| Sticky | None | None in panes; header is outside the pane's scroll |
| Narrow behaviour | Grid: 1, 3 or 5 columns by tier when asked; explicit tracks overflow; implicit tracks wrap. Modal: none | Panes switch views below lg; the inspector never stacks under content |
| More than two panes | Three-column and all-panels modal stories | functional-patterns' Panes rule: at most two panes beside the sidebar; a deeper level replaces the detail or opens in a sheet (`skills/neon-audit/references/functional-patterns.md:21-24`) |

The primitives map onto what Neon's base already has. HStack and VStack are Tailwind `flex` / `flex-col` with `gap-*`. Grid's three modes are `grid-cols-[repeat(n,minmax(0,1fr))]` (Tailwind's `grid-cols-n` is exactly that), an arbitrary `grid-cols-[…]`, and `grid-cols-[repeat(auto-fill,minmax(…,1fr))]`. GridColumn is `col-span-n`. Responsive values are Tailwind's breakpoint prefixes. The base is on Tailwind v4 (`registry/base/index.css:1`), and `registry/theme/neon.css` sets no `--breakpoint-*`, so those prefixes are Tailwind's defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. Their names collide with Neon's tier names (sm 320, md 500, lg 988, xl 1080) at different widths. Like CDS's responsive props, they key off the viewport. Inside the shell, though, the content pane is the viewport minus the sidebar and, from lg, minus the inspector. The Core snapshot has no Grid, Stack, Layout or full-screen component (`core/index.json` keys; `core/components/`).

### 4.2 With `coinbase-layout.md`

- **Confirms** P3's "Stated" line: CDS teaches ratio splits with `fr`, and the story's ratio examples (`1fr 2fr 3fr`) are the same mechanism the Grid docs give for a 2:1 split (`docs Grid:40`).
- **Refines** P15's "Stated" line ("Grid's `templateColumns` takes no breakpoint object: use `useBreakpoints`"). That holds for the `templateColumns` prop. The Box style prop `gridTemplateColumns` does take `{phone, tablet, desktop}`, and the story uses it (`L:450-456`; `styleProps.ts:117`, `:153-161`).
- **Confirms** P10's tiers. Responsive props have only `phone`, `tablet` and `desktop` plus `base` (`styleProps.ts:153`), so per-tier changes inside CDS components are possible only at 768 and 1280. The app's rail threshold (1061–1080, observed) and search collapse (901–1024) cannot come from these props; the note's "set in script" observation fits.
- **Adds nothing to** the shell, the sticky rail, sections, the action dock or page types. The Storybook has none of them. Its only multi-pane composition, the full-screen modal, scrolls each panel on its own. That is the model of Neon's `ResponsivePanes`, not the window-scroll model the note measured (P2), but it is a task overlay, not the app shell.

## 5. Recommendations (opinion)

**Decided.** The owner answered "Yes, do both" on 2026-11-15: recommendations 1 and 2 are done. The rules are "Grids inside a pane" in `skills/neon-audit/references/functional-patterns.md`. The guard is `widePanes` in `evals/templates/layouts.spec.mjs`, run on every layout at six widths, with a case showing it catches a `max-content` grid that the document check misses. The other recommendations and the open questions stay open.

Ranked by value for the effort, each checked against ADR 0006 (shadcn base, CDS frozen), ADR 0008 (superseded growth rule), ADR 0009 (Neon matches Core; growth only with an approved Core Counterpart) and ADR 0011 (four layers; no reference values; skills name no reference product).

1. **Add three in-pane grid rules to functional patterns.** Place: `skills/neon-audit/references/functional-patterns.md`, a short "Grids inside a pane" list under Panes. Name no product.
   - A collection of tiles of unknown count takes an implicit grid, `repeat(auto-fill, minmax(<min>, 1fr))`, so it wraps by itself at every tier.
   - Where a fixed number of equal columns (`grid-cols-n`) must change count, key it to the pane's width with a container query (Tailwind v4's `@container` and `@md:`-style variants), not to a viewport prefix. `minmax(0, 1fr)` tracks never wrap, so they overflow in a narrow pane. A viewport prefix changes at the wrong width once the sidebar and inspector take their share, and its names mean other widths than Neon's tiers (section 4.1).
   - Never size tracks with `max-content` around text, because the row then sets the page width.

   Fits ADR 0011: this is layer 4 (in-app patterns), taught as a mechanism, with no value copied. Fits ADR 0009: it uses Tailwind on the Neon base and adds no item. Each rule is backed by a measurement in section 2.
2. **Add an eval guard: nothing inside a pane is wider than the pane.** Place: a generated-app check in `evals/skills`, or `evals/templates/layouts.spec.mjs` for the starter screens. Assert `scrollWidth <= clientWidth` on each pane's scroll container, at 320, 500 and 988. A document-level check is not enough in the functional shell. `.neon-layout` is `height: 100dvh; overflow: hidden` (`registry/layout/layout.css:1-9`), so `document.documentElement.scrollWidth` stays at the viewport width however wide a pane's grid gets. The existing checks are document-level (`layouts.spec.mjs:116`, `:312`), apart from the calendar's own surface (`neon-a11y.spec.mjs:593`, `:604`). Keep the document check for a themed `ImmersiveLayout`, which scrolls the window. This is the executable form of page-anatomy's "the page itself never scrolls sideways". The story's own last example shows how easily a grid breaks it (a 2010px document at 1440). Fits all four ADRs: it tests Neon's code against Neon's rule.
3. **Add a primitives card to the example library, as `status: illustrative`.** Place: `docs/design/example-library.md` candidates. One runnable page of Neon's own: flex row, ratio split, 12-column span, an implicit tile grid and a responsive count, each at 375 and 1440, with synthetic content and Neon tokens. It answers "which grid for this collection" with evidence, as the story does for CDS. Fits ADR 0011 and 0009 if built from Neon items and Tailwind only. It stays illustrative until the designated reviewer approves it, per that doc. Lower priority than 1 and 2, because agents read rules more reliably than pictures.
4. **Leave out a full-screen task layout for now.** The modal's header, left, centre and right panels, and top and bottom bands, would suit a long single-task flow such as onboarding or a multi-step form. **Conflicts:**
   - ADR 0011: a new layout is a shell change with its own issue, and an agent reports a misfit rather than adding one.
   - ADR 0009: Core has no approved full-screen or shell component to match. The snapshot's Sheet and Navigation docs are iPhone-shaped.
   - functional-patterns' at-most-two-panes rule.

   `ImmersiveLayout` (logo header, one content pane) already covers a focused single task. If a flow needs a fixed footer, the Button dock pattern already supplies it.
5. **Don't add Grid, Stack or Box registry items.** **Conflicts:**
   - ADR 0009: there is no Core Counterpart.
   - ADR 0006: shadcn has no such items, and Tailwind's utilities already do the work. A wrapper would be a second layout API beside the one every shadcn doc uses.
6. **Don't build a Storybook for Neon's registry.** The [Carbon note](../docs/research/carbon-mcp-and-checklist.md#dont-adopt) already declined Storybook, because ADR 0009 keeps shadcn's docs as the developer reference. Neon already has a Catalog site that lists its items under their Counterparts' names (ADR 0008, ADR 0009; `scripts/lib/core-snapshot.mjs:147`). This note did not open it. If a "layouts" page is wanted, it belongs there, rendering `registry/layout/` at Neon's tiers. That would be the one place where Neon could show what the Storybook does not: real panes at real breakpoints.
7. **Don't adopt CDS's three tiers or the responsive-object prop style.** Neon's seven tiers come from Finnomena's own Figma frames. functional-patterns already says to name layouts by the app's tiers, not by another system's pixels (`functional-patterns.md:56-58`).

## 6. Open questions for the owner

1. Is "Examples / Layouts" what you expected? It teaches flex and grid primitives and shows no page layout. If you meant page-level layout examples, is the Catalog the place to show Neon's five layouts at each tier (recommendation 6)?
2. Should the in-pane grid rules (recommendation 1) go into `functional-patterns.md` now, with an eval case, or wait until a generated app has shown the problem?
3. Do you want the overflow guard (recommendation 2) to run on generated eval apps as well as on registry items? Generated apps are where an agent's own grids would break it.
4. Is a full-screen task layout (header, side panels, footer band) a need in any Back Office flow you know of? If so, it starts as a registry issue and probably a Core request, not as an agent's choice.
5. Tailwind's default prefixes (`sm` 640, `md` 768, `lg` 1024) share names with Neon's tiers (`sm` 320, `md` 500, `lg` 988). Should the Neon base define `--breakpoint-*` to match the tiers, or should the skills steer in-pane responsiveness to container queries and leave viewport prefixes alone?
6. Should someone tell CDS about the stale row-gap claim (`L:512-515`) and the `columns`/`templateColumns` slip in the Grid docs (`docs Grid:40`)? That is outside Neon. This note files nothing.
