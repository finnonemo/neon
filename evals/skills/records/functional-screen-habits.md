# Functional screen habits

neon-review's [Functional screen habits](../../../skills/neon-review/references/review-checks.md#functional-screen-habits) table lists eight generated-dashboard habits, each with a CDS component, prop or composition alternative and no CSS override. It says Neon navy structure and indigo focus, selection and links are contract roles, not habits, and that review-only edits nothing. Look and fix in verification.md links it from the critique. [Tables on narrow screens](../../../skills/neon-create/references/new-ui-workflow.md#tables-on-narrow-screens) in new-ui-workflow.md turns a table in a container narrower than about 640px into two-line rows: identity and key figure, then every other field with its label. `functional-habits.test.mjs` covers the section order, the rows, the absence of CSS and navy/indigo rows, the link and the narrow-screen rules.

November 2026, Claude Code 2.1.316, `claude -p --model claude-opus-5-5 --setting-sources project,local --plugin-dir <package> --add-dir <package> --mcp-config <browser> --strict-mcp-config --permission-mode dontAsk`, with the evaluator's browser tool from [Browser probe in verification](browser-probe-in-verification.md). Baseline is the `8a98f91` package; revised is `eef5202`. Each sample ran on a fresh fixture copy in its own git repository outside the Neon checkout. Allowlist: `Read Edit Write Glob Grep Skill`, the five `mcp__browser__*` tools, and `Bash(…:*)` for `ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx`, `npm run`, `git status/log/diff/ls-files/rev-parse/show/branch`, plus `sips` and `file` from Revised-2 on and `python3` from Baseline-2 on (Baseline-2, Revised-3 and the build baseline). Bash was never unrestricted.

## Review of a habit-laden screenshot

Fixture (`.local/evals/54-tools/fixtures/review`): a 1440×900 light-mode "Fee overview" screenshot with an on-token navy `#01172b` sidebar, an indigo `#6968ef` active bar and indigo `#4645ec` underlined links. It carries every habit: a "Welcome back 👋" title, four tinted icon KPI tiles, a single-series bar chart with a different color per bar inside a nested card, zebra rows with uppercase tracked headers, centered figures, saturated status chips, and pagination under the overview. Request, verbatim:

> /neon:neon-review Review this Finnomena back office screenshot: fee-dashboard.png. Ops staff open this fee overview every morning to see what changed.

Pass requires findings that name the habits with visible evidence and give the CDS or composition alternative, leave navy and indigo unflagged, and edit no file.

| Item | Baseline-1 | Baseline-2 | Revised-2 | Revised-3 |
| --- | --- | --- | --- | --- |
| Denied commands | 1: `cd … && python3` pixel sampling | 1: a multi-line `python3 -I -c` | None | None |
| Files edited | None | None | None | None |
| Habits named as habits | Tiles, emoji title, per-bar chart colors, nested card, centered figures | Tiles, emoji title, centered figures | Emoji title, tiles, saturated chips, per-bar colors, zebra and uppercase, centered figures, pagination | All eight |
| Missed | Chips (contrast only), zebra and uppercase; recommended more rows instead of removing pagination | Chips, pagination, chart colors, zebra | Nested card | None |
| CDS alternatives | None | None | `Tag emphasis="low"` with green, yellow, red, gray; CDS `Table` defaults with `compact`; `tabularNumbers`; a "View all" link | The same, plus one container per group |
| Navy and indigo | Indigo links flagged as brand drift: "default browser-blue links" | Links called "default browser blue … not the contract's indigo" | Not flagged | Listed under "What already follows the contract" |
| Verdict | Fail | Fail | Pass | Pass |

Both baselines read review-checks.md and INSTRUCTION.md, so routing did not differ. That the table caused the difference is unverified with two samples per arm. The grader's keyword hits are loose (Baseline-1 mentions pagination while recommending more rows), so the verdicts come from reading each report. A void first revised sample (`54-review-void-1`) used an earlier fixture whose navy and indigo were off-token and had one denied compound `sips …; grep …`. It named all eight habits and called the off-token links "blue-violet, not Finnomena's indigo", which was correct for that fixture.

## Finnomena fund-fee table at 375px

Fixture (`.local/evals/54-tools/fixtures/fees-app`): the #53 approvals app with its Home title set to "Finnomena Back Office", Vite pinned to port 5401 and the dev server started before each run. Request, verbatim:

> /neon:neon-create Add a Finnomena fund-fee table to this back office app: one row per fund with fund name, fund code, AMC, front-end fee, back-end fee, management fee, total expense ratio and fees collected this month. Ops staff mostly check it on their phones, so it must work at 375px. Use mock data and keep the app's shell, routes and theme. The dev server is already running at http://localhost:5401.

Pass requires every value shown at 1440px to be visible and untruncated at 375px, no sideways-scrolling table, and rows that lead with identity and the key figure. `grade-fees.mjs` compares the visible text at both widths in headless Chrome.

| Item | Baseline | Revised |
| --- | --- | --- |
| Denied commands | 1: a `cd … && grep` in CDS types | 1: a `cd <package> && ls; sed …` read of the guidance, then read with Read |
| Read | new-ui-workflow.md, verification.md and INSTRUCTION.md through `cat`, browser-probe.js | INSTRUCTION.md, new-ui-workflow.md, verification.md, browser-probe.js |
| 375px layout | Stacked rows below 988px through a breakpoint hook and a page `fundFees.css` | CDS `Table` when the container is at least 640px, labeled rows below it; no CSS file |
| Row shape at 375px | Name and ฿ amount, code and AMC, labeled fees; 4–6 visual lines | Name and ฿ amount, code · AMC, labeled Front-end, Back-end, Mgmt, TER; 5–7 visual lines |
| Grader | 49 of 49 values at 375px, none truncated, no sideways scroller | 47 of 47, none truncated, no sideways scroller |
| Report | Done report with Look and fix rounds, Brand-ready | None: a browser `evaluate` call with a `setTimeout` promise hung for over 26 minutes and the run was killed |
| Verdict | Pass | Pass: the grader found every value; with no report, its Look and fix and Done lines are unverified |

This case does not discriminate on Claude Code: the baseline already stacked the rows without the pattern. The revised run followed the new section's 640px threshold and used CDS instead of page CSS.

Limits: two review samples per package and one build sample each, Claude Code only, no Codex, light mode only, one screenshot width for the review. Every sample except Revised-2 and Revised-3 had one denied command; the baselines' denials blocked pixel sampling, which the revised runs did not attempt. The baseline and revised samples did not all run with the same allowlist. The revised build has no final report, so its Look and fix and Done lines are unverified. The build fixtures' files were staged but not committed, so each run's `git status` showed the whole app as new and its `diff.patch` holds the full app. Not exercised: colors-only scope (chart and status rows only), `composition: 'preserve'`, and a habit table applied inside a build. Run logs, grades, screenshots and builds without `node_modules` are in `.local/evals/54-{review-baseline-1,review-baseline-2,review-revised-2,review-revised-3,review-void-1,build-baseline-1,build-revised-1}`; fixtures, the run script and the graders are in `.local/evals/54-tools`.
