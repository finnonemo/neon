---
scenarios:
  - request: Add a delete action with a confirmation to each row of a list on the Neon base
    observe: Looks the items up in the Core snapshot's index; reads the Usage of only the Core docs of the components it uses, not whole docs or the directory; picks the row action's, the confirm's and the cancel's hierarchy by Core's rules and names them
  - request: Recolor a page header on the Neon base, colors only
    observe: Reads no Core component doc; changes color roles only
  - request: Review a Neon-base screen for how it uses its components and actions
    observe: Each finding on a component names the Core doc, section and rule it breaks, as the snapshot words it; reads only the docs of the components on the screen; changes nothing
  - request: Audit what an app on the Neon base is built on and whether its components match the design system
    observe: Lists each file in `src/components/ui/` with its Counterpart from the index, or "none" with the index's reason; reads no component doc; changes nothing
---

# Core component rules

For finnonemo/neon#219: the four skills take component-level rules from the Core snapshot through [Core rules](../../../skills/neon-audit/references/core-rules.md), one conditional reference each, and the design contract and the functional patterns link Core instead of restating it. Each request ran once with `main` as baseline (`a975716`) and with this change as revised, November 2026, through `run-claude-case.mjs --model claude-opus-5-5 --serve-registry --cap 1800` on Claude Code 2.1.323, with the runner's allowlist, permission note and browser tool. The revised arm ran at three commits, because the wording changed after what the runs did:

- `812bc63`: the first wording. All four requests.
- `337cc4d`: "Start from the index, even when a reference already names a doc", "do not list or browse `core/components/`", and the functional patterns' Core links land on `#usage`. The create request, twice.
- `e4b59e3`, as proposed: the review fixes (which overlay a task opens in is Core's, a review cites Core on the Neon base only, Counterpart coverage matches a file only when it is the Neon item). All four requests.

Fixtures, in `.local/evals-fixtures/219/`: `plan-app` is an app from `node scripts/smoke-new-app.mjs` at this change with `list-row`, `tag`, `card` and `dialog` added. Its one screen lists a customer's recurring investment plans in Thai: plain rows with the fund, the schedule, the amount and a `Tag`, and one `Button`, on mock data. `plan-app-flawed`, for the review request, adds a `destructive` log-out button in the header and an edit panel whose footer holds two `default` buttons and a `secondary` Cancel.

Requests, verbatim; each run had its own port:

> /neon:neon-create The dev server for this app is already running at http://localhost:{port}. Each plan row needs a way to delete the plan. Deleting cannot be undone, so ask before deleting. Mock the delete.

> /neon:neon-redesign The dev server for this app is already running at http://localhost:{port}. Make the page header a navy band with white text. Change colors only; leave the layout and the components alone.

> /neon:neon-review The dev server for this app is already running at http://localhost:{port}. Review this screen for how it uses our components and its actions. Review only, do not change anything.

> /neon:neon-audit Assess what this app is built on and whether its components match our design system. Do not change anything.

Core reads below are from `reference-reads.mjs` and from a by-hand list of every tool call in the run that names `core/`.

## Create

| | Baseline `a975716` | Revised `812bc63` | Revised `337cc4d`, first | Revised `337cc4d`, second | Revised `e4b59e3` |
| --- | --- | --- | --- | --- | --- |
| Index | Not read | Not read | Searched for its items | Searched for its items | Three entries printed by a script |
| `hierarchy.md` | Not read | Whole | Whole | Whole | Whole |
| Component docs | None | `alert.md` whole; part of `button.md`, `empty-state.md`, `icon-button.md`; headings of `list-item.md`, `snackbar.md` | Usage of `alert.md`; the destructive flow in `button.md` | Usage of `alert.md`, `list-item.md`, `button.md` | Usage of `alert.md`, `button.md`, `empty-state.md` |
| Listed `core/components/` | No | Yes | No | Yes | No |
| Confirmation | The installed `dialog` | Added `@neon/alert-dialog` | Added `@neon/alert-dialog` | Added `@neon/alert-dialog` | Added `@neon/alert-dialog` |
| Row action | `ghost` icon button | `secondary` icon button | `secondary`, `icon-sm` | `secondary` icon button | `secondary` icon button |
| Cancel, confirm | `ghost`, `destructive` | `AlertDialogCancel`, `destructive` | Cancel, `destructive` | Cancel, `destructive` | `AlertDialogCancel`, `destructive` |
| Denied commands | One compound command | One, redone with Grep and Read | One | One: `python3` on the index | One compound `sed`, redone with Read |
| Turns, cost | 44, $1.01 | 64, $1.47 | 55, $1.28 | 61, $1.40 | 59, $1.34 |
| Verdict | Unverified: no Core rule read, so the hierarchy is the model's own | Fail: skipped the index, read a doc whole and listed the directory | Pass | Fail: listed the directory; the reads and the hierarchy pass | Pass |

The `812bc63` run opened `functional-patterns.md` and Core rules in one command, then followed the patterns' direct links to Core docs. That is why `337cc4d` says to start from the index and lands each pattern link on `#usage`. From then on every run found a doc's `## Usage` and read from there. The hierarchy changed with the first revised run and stayed: the row action is Secondary (Core's rule 3) where the baseline chose Tertiary, and the confirmation is the Neon item whose Counterpart is Core's Alert. Both revised runs that built an empty state gave it a `secondary` `sm` button, as Core's Empty state has it.

## Colors only

| | Baseline `a975716` | Revised `812bc63` | Revised `e4b59e3` |
| --- | --- | --- | --- |
| Core reads | `core/theme.json`, for Navy; no component doc | None | None |
| Change | Two lines: `bg-primary text-primary-foreground` on the header | The same two lines | The same two lines |
| Denied commands | None | None | One compound command |
| Turns, cost | 23, $0.65 | 29, $0.60 | 26, $0.60 |
| Verdict | Pass | Pass | Pass |

## Review

| | Baseline `a975716` | Revised `812bc63` | Revised `e4b59e3` |
| --- | --- | --- | --- |
| Core reads | None | Core rules; `hierarchy.md` whole; the index searched for `button`, `tag`, `list-row`; Usage of `button.md`, `display-tag.md`, `list-item.md` | Core rules; `hierarchy.md` whole; the index whole; Usage of the same three docs |
| Log-out as `destructive` | "In Neon, `destructive` is only for…", no rule named | Core `hierarchy.md`, rule 5 | Rule 5 and `button.md` › Hierarchy |
| Two `default` buttons | Found, no rule named | Rule 1 and `button.md` › Pairs: "Never two Primaries" | Rule 1 and `button.md` › Pairs |
| Cancel as `secondary` | Not raised | Rule 4 | Rule 4 |
| Rows | Not raised | `list-item.md` › Hierarchy: the whole row is the tap target | `list-item.md` › Usage |
| Files changed | None | None | None |
| Turns, cost | 19, $0.45 | 26, $0.62 | 27, $0.65 |
| Verdict | Fail: no finding names a Core rule | Pass | Pass |

The quoted rules were checked against the snapshot: `button.md` holds "Never two Primaries" under Pairs, and `list-item.md` holds the whole-row rule under Usage › Hierarchy.

## Audit

| | Baseline `a975716` | Revised `812bc63` | Revised `e4b59e3` |
| --- | --- | --- | --- |
| Core reads | None | Core rules whole; the index whole; no component doc | Core rules' Counterpart coverage section; the index by a script; no component doc |
| Counterpart list | None | Seven files: Button, Display tag, List item, Tooltip, Snackbar, `dialog` → Alert with the index's reason, `card` → none with the index's reason | The same seven rows |
| Files changed | None | None | None |
| Denied commands | One `ls` | None | None |
| Turns, cost | 11, $0.28 | 10, $0.31 | 15, $0.37 |
| Verdict | Fail: the report names no Counterpart | Pass | Pass |

Both revised runs also reported that the installed `card.tsx` header still names CDS's ContentCard. The seven Counterparts match the snapshot's index.

Limits:

- One sample per arm and commit, apart from the two create runs at `337cc4d`, which differ: one listed `core/components/` and one did not. Each cell is what a package did once, not a rate.
- A read was graded from `reference-reads.mjs` and the by-hand list together. The tool lists neither a path relative to the Neon root (`cd <root> && cat core/…`), nor a shell glob, nor a search of a whole directory, and it counts a script that prints parts of the index as "named only".
- A doc's Usage was read whole from its heading, Core's bookkeeping included. No run was checked for treating a sample frame or a draft note as a rule.
- `neon-redesign` with `composition: 'adapt'`, and visual-system scope, were not exercised: the redesign request is colors-only.
- Every file in the fixture's `src/components/ui/` is a Neon item. Counterpart coverage for an app on CDS, on stock shadcn or with its own components was not tried, and neither was a review on those bases.
- The pages were graded on the report, the diff and the source, not on how they look.
- Both arms used an app built from this change, and the served registry is this checkout's.
