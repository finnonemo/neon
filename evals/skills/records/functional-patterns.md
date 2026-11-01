---
scenarios:
  - request: Build a Finnomena fund-switch form for mobile, in the starter
    observe: At 375px the submit action sits in a bottom dock above the bottom tab bar (or the tab bar is hidden for the flow); the dock covers no field; buttons stacked, primary nearest the bottom; one primary action on the screen.
  - request: Build a Finnomena notification-settings screen
    observe: Settings render as list rows with inset dividers and no divider after the last row, not one card per setting; no shadows on on-page regions.
  - request: Build a Finnomena request tracker (row actions)
    observe: Row approve/reject actions are secondary or tertiary; the screen has one primary action.
  - request: "`$neon-redesign` colors-only on an existing card-per-row settings screen"
    observe: Cards, order and geometry unchanged; any pattern miss is reported, not fixed.
  - request: "`$neon-redesign` composition: 'adapt' on a CSS-only list screen"
    observe: Applies the principles in CSS; adopts no component library.
---

# Functional patterns

Rules in [functional patterns](../../../skills/neon-audit/references/functional-patterns.md), drawn from local research into two public product design systems (kept in `.local/research/references/`). They name no component library; CDS component and prop names sit only in its closing note for apps already on CDS, which is frozen. Static guards: `functional-patterns.test.mjs`. The request-tracker row shares its request with [First screen](first-screen.md).

November 2026, Codex 0.162.1, one sample per revision, run concurrently through `run-codex-case.mjs` on a folder holding only `.gitkeep`. Before is `6c0a1f6`; after is `501dc38`, when the reference still gave CDS names inline (moved to its frozen CDS note in `bf4b907`; not rerun since). Request, verbatim:

> $neon-create Build a Finnomena notification-settings screen in a new notification-settings folder here. Customers turn email, push and LINE notifications on or off for each topic (fund NAV updates, order status, monthly statements, promotions), and set a quiet-hours window. It must work well on mobile and desktop. There is no backend yet, so use mock data.

Only the after run read `functional-patterns.md` (`reference-reads.mjs`); both read INSTRUCTION.md, new-ui-workflow and verification. The evaluator built both and measured them in headless Chromium at 375×812 and 1440×900, light mode.

| Item | Before | After |
| --- | --- | --- |
| Mobile save action | Cancel and Save side by side at the end of the page, not docked | Save alone, full width in a bottom dock fixed to the viewport; scrolled to the end, the dock covers no field |
| Primary actions | One (Save) | One (Save); Cancel dropped |
| Shadows | None | One, on the dock only |
| Grouping | Topic rows inside two white cards on a grey page | Flat sections on white, rows split by dividers, no card containers |
| Headings | Title and description run together on one line at both widths | Separate lines |

The dock is the change the new rules most directly explain. Card containers that group a section were never forbidden, so the flat grouping is weaker evidence, and the run-together headings are a layout bug unrelated to these rules. Neither shell showed a bottom tab bar, so the dock/tab-bar overlap rule was not exercised. Neither run used `ListCell`, `Tray` or `Divider`: both hand-wrote CSS with literal font sizes, and the after run set `h1` to weight 600 by hand, against INSTRUCTION.md's generated typography roles. In both, unchecked switch tracks render white on white (`bgTertiary` is white). Limits: one sample each, Codex only, light mode, no interaction beyond load and scroll, and the colors-only, adapt and tracker rows above were not run.
