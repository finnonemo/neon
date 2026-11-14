---
scenarios:
  - request: Add an inline way to pick the first and last day of a pause to a recurring plan screen on the Neon base, and say whether the save worked
    observe: The Calendar takes `mode="range"` and none of `numberOfMonths`, `captionLayout`, `showWeekNumber` or `showOutsideDays`; the base's one Toaster gains no `richColors`, `closeButton` or `expand`
---

# Props passed through to a library

For finnonemo/neon#291: the Neon base reference's Components guidance now says that Calendar and Toaster hand the props they do not name on to react-day-picker and sonner, and that one of those props that draws what the item's header does not describe still works, is not in Core and is never chosen in new work. The request ran once with `main` as baseline (`07cd790`) and with this change as revised (`316865f`), November 2026, through `run-claude-case.mjs --model claude-opus-5-5 --serve-registry --cap 1800` on Claude Code 2.1.325, with the runner's allowlist, permission note and browser tool.

Fixture, in `.local/evals-fixtures/291/plan-app`: an app from `node scripts/smoke-new-app.mjs` at this change. Its one screen is a recurring investment plan in Thai on mock data: the fund, the amount each month, the debit day and a save button that does nothing. It holds `button`, `dialog`, `sonner` and `tooltip`, and no calendar.

Request, verbatim; each arm had its own port:

> /neon:neon-create The dev server for this app is already running at http://localhost:{port}. On the recurring investment plan screen, customers also need to pause the plan for a while: add a way to pick the first and the last day of the pause, shown inline on the screen above the save button. Saving takes about two seconds; mock it. Tell the customer when the plan is saved, and when it is not saved (make the mock fail when no pause is picked).

| | Baseline `07cd790` | Revised `316865f` |
| --- | --- | --- |
| Calendar `mode` | `range` | `range` |
| Calendar props that draw what Core does not (`numberOfMonths`, `captionLayout`, `showWeekNumber`, `showOutsideDays`) | None | None |
| Other Calendar props | `selected`, `onSelect`, `locale`, `disabled`, `startMonth`, `formatters` | The same, and `labels` |
| Toaster in `AppRoot` | Unchanged: `theme` only | Unchanged: `theme` only |
| Saved | `toast.success` | `toast.success` with a description |
| Not saved | An `error` Alert above the save button | The same |
| Neon items added | `calendar`, `alert` | `calendar`, `alert` |
| Read `neon-base.md` | 97% | 100% |
| Read the installed `calendar.tsx` | Yes | Yes |
| Read the installed `sonner.tsx` | Yes | Yes |
| Denied commands | One: a `cd` joined to `awk` with `;` | One: a `cd` joined to a `for` loop |
| Turns | 48 | 50 |
| Cost | $1.19 | $1.43 |
| Verdict | Pass | Pass |

The two packages made the same choices. The baseline package says nothing of these props, and its run chose none of them all the same: it read the installed `calendar.tsx` before using it, whose header already says that react-day-picker's other props have no cell in Core. That the run took the choice from there is inferred from the read, not shown. So on a request that does not ask for a second month or week numbers, the guidance is shown to do no harm, not to change a choice.

Both runs set `formatters.formatCaption` to print the month with a Buddhist era year. The calendar's header says its dates never turn the year Buddhist; neither package's guidance speaks of it, and this change does not touch it.

Limits:

- One sample per arm, so each cell is what a package did once, not a rate.
- No request asked for two months side by side, a month and year list or week numbers by name, so what a run does when an employee asks for a prop that is not in Core was not seen.
- The fixture holds no calendar that already uses one of these props, so "leave it where an app already uses it" was not exercised.
- Nothing invited a Toaster prop: the base's `AppRoot` already renders the one Toaster, and both runs only called `toast.success`.
- The runs were graded on their diffs and reports, not on a look at the apps.
- The denied command in each run was a compound one; neither run then reported the shell as blocked, so neither is void.
- The served registry is this checkout's.
