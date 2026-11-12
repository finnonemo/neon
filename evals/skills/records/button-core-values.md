---
scenarios:
  - request: Add two less prominent actions beside the buy button of a fund page on the Neon base, where a share button already uses `outline`
    observe: The new actions take `secondary`, `ghost` or `link`, never `outline`; the existing `outline` button is left as it is; the screen keeps one primary action
  - request: Show an order in progress on the buy button of a fund page on the Neon base, and stop a second press placing a second order
    observe: Sets `loading` on the Button while the order runs; builds no spinner of its own and does not swap the label for text that changes the button's width
---

# Button variants and loading

For finnonemo/neon#215: the Neon base reference's Components guidance now names every Button variant by Core's use for it, says `outline` still works but is not in Core and is never chosen in new work, lists the sizes `default` (56), `md` (48), `sm` (36) and `xs` (28), and says to set `loading` while a Button's action runs. Each request ran once with `main` as baseline (`697efba`) and with this change as revised (`a164908`), November 2026, through `run-claude-case.mjs --model claude-opus-5-5 --serve-registry --cap 1800` on Claude Code 2.1.322, with the runner's allowlist, permission note and browser tool.

Fixture, in `.local/evals-fixtures/215/fund-app`: an app from `node scripts/smoke-new-app.mjs` at this change, so both arms start from the retuned Button and differ only in the package. Its one screen is a fund overview in Thai on mock data: the fund name, its unit value beside a small share button with `variant="outline"`, two paragraphs of investment policy and a buy button.

Requests, verbatim; each arm had its own port:

> /neon:neon-create The dev server for this app is already running at http://localhost:{port}. Beside the buy button, add a less prominent action that opens the fund fact sheet, labeled “ดูหนังสือชี้ชวน”, and one more low-key action that adds the fund to the watchlist, labeled “เพิ่มในรายการโปรด”. Mock both.

> /neon:neon-create The dev server for this app is already running at http://localhost:{port}. The buy button places an order, which takes about two seconds; mock it. Show that the order is in progress on the button, and make sure a second press does not place a second order.

| | Baseline `697efba` | Revised `a164908` |
| --- | --- | --- |
| Actions: fact sheet button | `secondary` | `secondary` |
| Actions: watchlist button | `ghost`, with `loading` while its mock call runs | `ghost`, with `loading` and `aria-pressed` |
| Actions: `outline` in the new work | None | None |
| Actions: the existing `outline` share button | Unchanged | Unchanged |
| Actions: primary Buttons on the screen and in the dialog | One, the buy button | One, the buy button |
| Actions: other Button values used | `size="md"` and `size="sm"` in the fact sheet dialog | `size="md"` in the fact sheet dialog |
| Loading: buy button | `loading` set while the order runs, plus a ref that drops a press before the render | The same |
| Loading: a spinner of its own, or a label swap | Neither | Neither |
| Files changed (actions, loading) | 4 (`src/App.tsx`, two feature files, a service), `src/App.tsx` | `src/App.tsx`, `src/App.tsx` and a service |
| Denied commands | None | None |
| Turns (actions, loading) | 41, 21 | 28, 26 |
| Cost (actions, loading) | $0.80, $0.43 | $0.63, $0.49 |
| Verdict | Pass: both | Pass: both |

The two packages chose the same Button values on both requests. The baseline package names none of `md`, `xs`, `brand`, `inverse` or `loading`, and its run used `md` and `loading` all the same: both of its runs read the app's own `src/components/ui/button.tsx` before editing (`run-digest.mjs`: a Read in the actions run, a `cat` in the loading run). That file's header says what each variant and size is in Core and that `outline` has no value there, and its `loading` prop says what loading does. That the run took the values from there is inferred from the read, not shown. So on an app that already holds the retuned Button, these requests do not show what the guidance adds; they show that it does no harm and that neither package reaches for `outline` beside a button that uses it.

Limits:

- One sample per arm, so each cell is what a package did once, not a rate.
- Both arms started from an app that already holds the retuned Button and its header comment. A request that creates an app, where the guidance is read before any item's source, was not run, and neither was an app on the earlier Button.
- No request asked for an outlined button by name, and none called for `brand`, `inverse` or `xs`.
- The runs were graded on their diffs and reports. That a loading button keeps its size is each run's own report and this change's browser test, not a measurement of these apps.
- The revised package is `a164908`. Afterwards `main` was merged into the branch, the Button's fills in an Immersive Theme changed, and review reworded one clause of the guidance: `destructive` is "to confirm a destructive action (the confirmation step, not the button that opens it)", where the runs read "for a destructive action". Neither request involved a destructive action, and the runs were not repeated.
- The served registry is this checkout's.
