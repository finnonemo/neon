---
scenarios:
  - request: Build a Finnomena fund page in the starter, where a customer reads one fund's value over time and buys it
    observe: The value and its change are the first and largest text in content, with the chart straight after at the pane's full width; the buy action sits in the inspector and nothing the content needs does; at 375px the buy action is visible in the content view without opening the inspector; one primary action.
  - request: Build a Finnomena home page for a Product Feature app with three areas (funds, orders, goals)
    observe: Content is one section per area with the same header row, each previewing at most five rows and ending in one action that opens the full collection; sections separate by a hairline, with no card per section or per row; the page is about two viewports tall at 1440×900.
  - request: Build a Finnomena account settings screen with profile, notifications and security
    observe: Takes the list and detail layout from the start; the groups are rows in the list pane, not sidebar items; each detail row has a title, description, current value and one trailing secondary or tertiary action.
  - request: "`$neon-redesign` colors-only on an existing dashboard of tinted KPI tiles"
    observe: Tiles, order and panes unchanged; any page anatomy miss is reported, not fixed.
---

# Page anatomy

Rules in [page anatomy](../../../skills/neon-audit/references/page-anatomy.md): which layout a whole functional page takes, what each pane holds and the order of its regions. Drawn from [research/coinbase-layout.md](../../../research/coinbase-layout.md), which measured one reference product's signed-in pages on 14 November 2026. Following [ADR 0011](../../../docs/adr/0011-a-functional-screen-has-four-layers-each-with-one-source.md), the reference names no product and carries no value from it; where the research conflicts with Neon's shell (scroll model, how the content area divides, the right pane on narrow tiers, tier boundaries), the shell holds and the rule is restated inside it. Static guards: `page-anatomy.test.mjs`.

## Runs, 14 November 2026

One sample per row with `run-claude-case.mjs --serve-registry` and `claude-opus-5-5`, each building a new app in an empty folder. Baseline is `ecfb0f8`; revised is `85790d8`. Requests, verbatim after `/neon:neon-create`, each ending "It must work well on mobile and desktop. There is no backend yet, so use mock data. Run its dev server on port <n>.":

> Build a Finnomena fund page in a new fund-page folder here. A customer reads how one fund's value has moved over time, sees its key facts, and buys it.

> Build the home page of a Finnomena customer app in a new home folder here. It covers three areas: funds the customer holds, their recent orders, and their savings goals. From it the customer can start a new investment.

> Build a Finnomena account settings screen in a new account-settings folder here, with profile, notifications and security settings.

| Case | Ref | Cost (USD) | Turns | Minutes | Denied commands |
| --- | --- | --- | --- | --- | --- |
| Fund page | baseline | 6.49 | 70 | 10.7 | 1 |
| Fund page | revised | 5.29 | 81 | 8.3 | 1 |
| Home | baseline | 6.31 | 105 | 10.1 | 4 |
| Home | revised | 5.72 | 99 | 9.0 | 2 |
| Settings | baseline | 8.74 | 140 | 17.7 | 3 |
| Settings | revised | 6.13 | 113 | 10.7 | 5 |

No run was void. The runner printed `failed (exit 1)` for each case after its report was written, from the `git add` of the app copy (an embedded repository), so no `diff.patch` was graded. Only the revised runs read `page-anatomy.md`, each in full (`reference-reads.mjs`); all six read functional patterns and the new UI workflow. The evaluator served each build with Vite and measured it in headless Chromium at 1440×900 and 375×812, light mode, on load.

| Item | Baseline | Revised |
| --- | --- | --- |
| Fund: figure first and largest | Largest (28px), but under the fund name, its code and two tags, at 240px | First in content at 116px, largest; the name moved to the pane header |
| Fund: chart | Inset by the gutter on both sides | Runs the content pane's full width, straight after the figure; range control beneath, in the gutter |
| Fund: sections | Separated by space only | Hairline between sections, text on one left edge |
| Fund: buy action | Inspector; bottom dock at 375px; one primary | The same |
| Home: layout | `ImmersiveLayout`: no panes, a two-column grid of holdings beside goals and orders | `ContentLayout`: sections stacked in content, the start-investment module in the inspector |
| Home: sections | Headings with no shared header row; space between areas | One header row per section (heading, one line of description), hairline between sections, no cards |
| Home: preview and open-all | Orders capped; no way to the full set | Orders capped with one full-width action, which expands in place; holdings and goals show every row and have none |
| Home: primary action at 375px | "ลงทุนเพิ่ม", primary, under the figure | "เริ่มลงทุน" in the pane header, visible on load but drawn as a secondary button |
| Home: height at 1440×900 | 974px | 1488px, about 1.7 viewports |
| Settings: layout | `AppShell`, groups as rows in the list pane | The same |
| Settings: detail rows | A form of labelled fields | Groups with a heading; each row a title, a description, its current value and a chevron |

**Home is the request the reference changed.** The baseline left the shell's panes for a page-wide grid; the revised run took the content and inspector split and stacked sections. Its thesis says it opened an overview with a figure, which the reference gives to balance pages, and reported that.

**Fund page: the order and the chart changed, the split did not.** Both runs put the buy module in the inspector and docked it at 375px, so this request does not show what "content answers; the inspector acts" changed.

**Settings: no difference in layout.** Both took the list and detail layout, as the contract already asks. The revised rows carry a current value and a chevron where the observe line asks for a trailing secondary or tertiary action; the baseline's form has neither.

Misses in the revised runs: on the home page only one of three sections ends in an open-all action and it expands in place instead of opening a collection, and the narrow-tier action is not drawn as primary. No shell file was edited in any run, no on-page region has a shadow, each page has one `h1` and none scrolls sideways.

## Rerun after tightening, 14 November 2026

`7123fba` answers the two home misses: every overview section ends in an open-all action that goes to the collection's own page, and the narrow-tier action stays primary. One more sample of the home request at that commit, same runner and model: 5.13 USD, 74 turns, 9.1 minutes, 2 denied commands, not void; it read `page-anatomy.md` in full.

| Item | Revised (`85790d8`) | Tightened (`7123fba`) |
| --- | --- | --- |
| Open-all | One section of three, expanding in place | All three sections end in one ("ดูกองทุนทั้งหมด", "ดูคำสั่งทั้งหมด", "ดูเป้าหมายทั้งหมด"), each going to a page of its own that is also a menu destination |
| Primary action at 375px | In the pane header, drawn as secondary | "ลงทุน" in the pane header, drawn as primary |
| Layout | `ContentLayout`, action module in the inspector | The same; no shell file edited |
| First-read | Portfolio total as a figure above the sections | The holdings section, with the total in its heading row; section headings (22px) are the largest text |
| Height at 1440×900 | 1488px | 1374px |

Both misses are gone in this sample. The page no longer opens with a figure, which is what the reference asks of an overview; whether that follows from the tightening or from sample variation, one run cannot say. The three collection pages were not opened or measured.

The colors-only row was not run: no fixture with tinted KPI tiles exists. It stays unverified.

Limits: one sample per row, graded by the author of the change from each run's thesis, source and two screenshots on load; nothing was clicked, so the dock opening the buy module, the settings rows' edit flow and the empty states were not exercised. Limits of the research carry over: no viewport below 500px or above 1510px was measured, the account held nothing so a populated portfolio page and transaction list were not seen, and no flow (form, confirmation, error) was opened.
