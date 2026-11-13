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

No scenario above has been run: the rows are unverified, with no before and after. Limits of the research carry over: no viewport below 500px or above 1510px was measured, the account held nothing so a populated portfolio page and transaction list were not seen, and no flow (form, confirmation, error) was opened.
