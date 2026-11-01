---
scenarios:
  - request: Add Finnomena approvals to an existing themed React/CDS app (Look and fix)
    observe: Before Done the run screenshots its screen at 375px and 1440px, writes at least one critique round naming the widths and applies fixes; the report gives each round its own line and no numeric score.
  - request: Add Finnomena approvals to an existing themed React/CDS app (readiness)
    observe: "The report says Brand-ready with a Handoff Summary: a Back Office screen is never Ship-ready, with or without a mock service. Open: Look and fix Revised-2 reported \"Ship-ready, apart from the mock service\"; unverified since"
  - request: Add Finnomena approvals to an existing themed React/CDS app (critique shape)
    observe: "Each Look and fix round's critique, in the run's messages, gives every finding as severity, location, evidence with width and state, who is affected, fix and recheck. Open: no revised run in Look and fix used this shape; unverified since"
---

# Look and fix

The shared checklist's [Look and fix](../../../skills/neon-redesign/references/verification.md#look-and-fix) section asks a run to screenshot its main task at 375px and 1440px, critique the screenshots in neon-review's finding shape, fix the top three problems, stop after three rounds, and report each round on its own line. Without visible screenshots it reports the loop as not run. neon-create and neon-redesign link it from step 5 and Done.

Fixture: the starter assembled at `6c0a1f6`, made into an existing app with Home and My requests hash routes (`src/app/useRoute.ts`), `src/services/requests.ts`, and a mock `src/services/approvals.ts` whose contract the comment says to keep. Vite is pinned to port 5301 and the dev server was started before each run. Each sample ran on a fresh copy of the fixture, in its own git repository, outside the Neon checkout so no `AGENTS.md` sits above it. Request, verbatim:

> /neon:neon-create Add a Finnomena approvals screen to this app for managers: a list of pending expense approvals they can open to see the details, then approve, or reject with a reason. Use the existing approval service in src/services/approvals.ts and keep the app's shell, routes and theme. The dev server is already running at http://localhost:5301.

Pass requires a written critique round in the report that names its screenshot widths, with fixes applied before Done, and no numeric score.

November 2026, Claude Code 2.1.316, `claude -p --model claude-opus-5-5 --setting-sources project,local --plugin-dir <package> --mcp-config <browser> --strict-mcp-config --permission-mode dontAsk --allowedTools <list>`. The browser is the evaluator's MCP tool from [Browser probe in verification](browser-probe-in-verification.md), whose screenshots reach the agent as images. `--setting-sources project,local` leaves out the evaluator's user hooks, which block `cd`. Baseline is the `6c0a1f6` package. Revised is `f1d0bc8` for the first sample, then `c1478c8`, which asks for the critique in messages and the widths on each report line. Runs used one of two allowlists:

- Narrow: `Read Edit Write Glob Grep Skill`, the five `mcp__browser__*` tools, and `Bash(…:*)` for `ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx`, `npm run`, and `git status/log/diff/ls-files/rev-parse/show/branch`. Every run after Revised-1 also passed `--add-dir <package>`.
- Full: the same tools with `Bash` unrestricted.

| Item | Baseline-1 (narrow) | Baseline-2 (full) | Revised-1 (`f1d0bc8`, narrow) | Revised-2 (`c1478c8`, narrow) |
| --- | --- | --- | --- | --- |
| Denied commands | 2: a multi-file `cat` with a variable assignment, a brace-expansion `ls` | None | 1: `ls` of the package outside the workspace | 2: `cd "$PWD"; cat …` and a `cd … \|\| cd …; pwd; grep` |
| Read verification.md | Yes | Yes, through `cat` | Yes | Yes |
| Screenshots | 5, at 1440 and 375 | 8, at 1440 and 375 | 12, at 1440 and 375 | 14, at 1440 and 375 |
| Edits after a screenshot | Yes, at 1440px: truncated list rows, cut to requester and date | Yes, at 1440px: list rows truncated in a 360px pane, rebuilt on `Pressable` (the agent blamed `ListCell`; unverified), and a yellow tag drawn white on white | Yes, at 1440px: a missing selected-row bar and textarea placeholder | Yes, at 1440px: truncated titles and amounts |
| Critique rounds in the report | None | None | "Round 1–3" under "Fixes I made after looking at screenshots"; no widths | "**Look and fix**": "Round 1 (1440px, list)", "Round 2 (1440px and 375px, details, reject and approve)", "Round 3 (1440px, empty and confirmation)", each with the fixes made, then problems left as they are |
| Build | Not run: reported the shell as blocked | Passed | Passed | Passed |
| Sample under the denial rule | Void | Counts | Void | Void, though it kept using the shell |
| Verdict | Fail | Fail | Fail: rounds without widths | Pass on the report criterion; the finding shape was not used |

Every run, baseline included, looked at its own screenshots and edited after a 1440px screenshot (see the table). Only the revised runs wrote rounds into the report. With one usable sample per arm, whether the skill change causes that is unverified. Neither revised run wrote findings in neon-review's shape (severity, location, evidence, fix, recheck) in its visible messages. Each wrote short notes such as "Fixing: keep the amount column at full width", so that part of the section is not yet followed. Revised-2's round lines name widths, but not in the fixed `Look and fix, round N (…)` shape, and round 1 used only 1440px screenshots. No report gave a numeric score. Revised-1 called the Back Office screen Ship-ready, against [Readiness](readiness.md). Revised-2 and Baseline-2 said Brand-ready. Run logs, screenshots, grades and diffs are in `.local/evals/53-{baseline-1,baseline-2,revised-1,revised-2}`. The fixture, run script and grader are in `.local/evals/53-tools`.

Limits: one usable baseline and one revised sample, Claude Code only, on the evaluator's browser tool. The orchestrator's rule voids any sample with a denied command, and only Baseline-2 had none. Revised-2's two denials did not stop it using the shell, but a rerun with full Bash was refused by the evaluator session's own permission classifier, so no clean revised sample existed until the [paired rerun](#paired-rerun-1-november-2026). The baseline and revised samples that count ran with different allowlists. Not exercised: colors-only scope, `composition: 'preserve'` on existing UI, dark mode (the fixture has none), and the no-screenshot fallback, including Codex. The "Functional screen habits" link was a placeholder in these samples; #54 added the table, see [Functional screen habits](functional-screen-habits.md).

## Paired rerun, 1 November 2026

This rerun closes the allowlist gap above: both arms used the same allowlist and the same harness note, on Claude Code 2.1.316, with the command above plus `--add-dir <package>` and `--append-system-prompt <note>`. Baseline is the `6c0a1f6` package. Revised is the `e968065` package; the package built from `df3f6d8` is byte-identical. Each sample ran on a fresh fixture copy under a 45-minute cap. Sample 1 of each arm ran at the same time, baseline on port 5301 and revised on 5302. Sample 2 swapped the ports.

- Allowlist: `Read Edit Write Glob Grep Skill`, the five `mcp__browser__*` tools (`navigate resize evaluate screenshot console`), and `Bash(…:*)` for `ls pwd cd cat head tail wc grep find echo test git status git log git diff git ls-files node npm npx mkdir cp sed rg sort which curl lsof kill sleep git rev-parse git show git branch npm run sips file python3`.
- Note, verbatim: "Shell permissions in this session: Bash is allowed for commands that start with one of: ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx sips file python3, npm run, git status, git log, git diff, git ls-files, git rev-parse, git show, git branch. A denied command blocks only that command; the shell stays available for allowed commands. Variable assignments, loops and $(...) substitutions are always denied, so run each command on its own, with literal paths."

| Item | Baseline-1 | Baseline-2 | Revised-1 | Revised-2 |
| --- | --- | --- | --- | --- |
| Denied commands | 1: `cd <app dir> && sed -i …` on the routes; it used Edit instead | 1: `cd node_modules/…; grep …` | 1: `cd node_modules/…; grep …` | 1: a `for` loop over CDS type files |
| Sample under the denial rule | Counts: it built afterwards | Counts, but killed at the cap with no report | Counts | Counts |
| Read verification.md | Yes | Yes, through `cat` | Yes, through `cat` | Yes, through `cat` |
| Screenshots | 8, at 1440 and 375 | 7, at 1440 only | 19, at 1440 and 375 | 13, at 1440 and 375 |
| Ran `<Neon root>/scripts/` tools | No | No | `probe-page.mjs` and `source-lint.mjs` | `probe-page.mjs` and `source-lint.mjs` |
| Critique rounds in the report | None; the Checks list names 1440px and 375px | No report | `Look and fix, round 1 (1440px)`, `round 2 (1440px)`, `round 3 (375px)`, each with its fixes | `Look and fix, round 1 (1440px)`, `round 2 (1440px)`, `round 3 (375px)`, each with its fixes |
| Build | Passed | Not reached | Passed | Passed |
| Readiness word | Ship-ready | None | Brand-ready | Ship-ready, apart from the mock service |
| Verdict | Fail: no critique rounds | Unverified: no report | Pass | Pass |

In Baseline-2, one browser `evaluate` whose promise never resolved ran from 02:43 to 03:13 UTC, when Claude Code's 1800-second MCP timeout aborted it: two-thirds of the 45-minute budget. The agent then split the probe into steps, but its next `navigate` got no reply until the cap closed the browser at 03:25. The harness's part in both stalls is unverified, so the sample is unverified rather than a fail. Both revised runs wrote round lines in the section's `Look and fix, round N (…)` shape. Revised-2's round 1 claim, amounts cut to "฿12,60…" in the list at 1440px, matches its first screenshot. Its round 3 fixes (focus after a decision, screen-reader announcements, an empty detail page after refresh) are behavior found by testing, not problems visible in a 375px screenshot. Neither revised run wrote findings in neon-review's shape in its messages. Baseline-1 and Revised-2 called the Back Office screen Ship-ready, against [Readiness](readiness.md). No report gave a numeric score.

Limits: one usable baseline and two revised samples, Claude Code only, on the evaluator's browser tool. Every sample had one denied command, and none stopped the build or the look. With one usable baseline, whether the skill change causes the round lines is still unverified. Revised-1 said the probe's 1440px pass timed out twice and checked that width by hand; the cause is unverified. Run logs, screenshots, grades and diffs are in `.local/evals/53-rerun-{baseline-1,baseline-2,revised-1,revised-2}` in the orchestrator worktree. The prep, launch and collect scripts, the allowlist and the note are in `.local/evals/53-rerun-tools`.
