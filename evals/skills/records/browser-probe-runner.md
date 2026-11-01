# Browser probe runner

[probe-page.mjs](../../../scripts/probe-page.mjs) runs the shipped probe in headless Chrome over a CDP pipe, with no npm dependencies, when the agent has no browser tool. It adds three Neon rules: IBM Plex Sans Thai faces loaded and drawing the Thai and Latin text, the Finnomena logo present, and the source brand absent from the title, meta content and alt text. The probe fixture's Neon cases, plus `probe-fixture-no-plex.html` and `probe-fixture-thai-404.html`, run in `run-probe.mjs --fixture`. Runner behavior (missing Chrome, launch failure, timeout, a page that does not load, screenshots kept out of the app) is in `probe-page.test.mjs`.

November 2026, one sample per agent per revision. Before is the `6c0a1f6` package. After is `3ff5f3f`. The fixture is a `.gitkeep` workspace plus a synthetic `./DESIGN.md` for "Lumora Summit": lime `#C6FF3D`, ultraviolet `#7A5CFF`, Space Grotesk, a LUMORA wordmark and a `Lumora Summit — See further.` title pattern. Request, verbatim (Codex starts it with `$neon-create`):

> /neon:neon-create Build a Thai event page in ./design-day for "Finnomena Design Day 2026", a free public design meetup on 12 December 2026, 13:00–17:00, at Finnomena's office. Include the agenda, three speakers and an add-to-calendar link https://calendar.google.com/calendar/event?eid=design-day. There is no sign-up form. Use ./DESIGN.md as the reference design.

Agents:
- Codex 0.162.1 through `run-codex-case.mjs`.
- Claude Code 2.1.316 (`claude-haiku-5-5`), `claude -p --plugin-dir <package> --strict-mcp-config` with an empty MCP config, so there were no browser or MCP tools. The init event confirmed this. It ran with `--permission-mode dontAsk` and this allowlist: `Read Edit Write Glob Grep Skill Bash(ls:*) Bash(pwd) Bash(cd:*) Bash(cat:*) Bash(head:*) Bash(tail:*) Bash(wc:*) Bash(grep:*) Bash(find:*) Bash(echo:*) Bash(test:*) Bash(git status:*) Bash(git log:*) Bash(git diff:*) Bash(git ls-files:*) Bash(git rev-parse:*) Bash(git show:*) Bash(git branch:*) Bash(node:*) Bash(npm:*) Bash(npx:*) Bash(npm run:*) Bash(mkdir:*) Bash(cp:*) Bash(sed:*) Bash(rg:*) Bash(sort:*) Bash(which:*) Bash(curl:*) Bash(lsof:*) Bash(kill:*) Bash(sleep:*)`.

The evaluator graded each build with the fixed runner (`253080a`), using `--serve <dist> --source-brand Lumora`, and grepped `./src/` and `./index.html` for `Lumora|C6FF3D|Space Grotesk|See further`. `--serve` binds an ephemeral port, so no fixed port was needed.

| Item | Codex, before | Codex, after | Claude, before | Claude, after |
| --- | --- | --- | --- | --- |
| Browser attempt | Own Playwright script from another `/tmp` project; Chrome SIGABRT in the sandbox | Ran the runner with `--serve design-day/dist --source-brand Lumora`. Result: `Not measured: Chrome exited on SIGABRT before measuring.` | None. It did not read verification.md | Read verification.md, then ran the runner with `--serve … --source-brand 'Lumora'`. Chrome launched and measured |
| Neon rules in the agent's run | Not measured | Not measured | Not measured | Plex loaded (400–700, Thai and Latin); 31 Thai and 4 Latin elements, all in Plex. Logo: `img "Finnomena" (by alt, asset shape)`, plus a false positive `div.dd-hero-image (by aria-label)`. `Lumora absent from title, 2 meta, 6 alt or aria-label and 40 text elements` |
| Acted on the runner | n/a | n/a | n/a | Its first 375px line named overflowing sections and a sideways scroller. It rebuilt three times and looked at the screenshots until the line read `375px clean; 1440px clean` |
| Report line | `Browser probe: not run; recheck at 375px and 1440px` | Same, printed by the runner | None: "I could not render it in a browser"; checks unverified | "Browser probe at 375px and 1440px is clean"; names "Lumora absent" |
| Evaluator: Plex, logo, brand | Pass, pass, absent | Pass, pass, absent | Pass, pass, absent | Pass, pass, absent; Lumora only in a source comment |
| Evaluator: other leads | Clean | 375px: overflowing `div.dd-orbit`, `div.dd-map-grid`; low contrast on the dark-fill calendar link at both widths | Clean | Clean |
| Verdict | Unverified: no runner yet; reported the probe as not run | Unverified: the runner ran but measured nothing, and printed the not-run line | Fail: no probe line | Pass: measured, cited and fixed |

The after Claude run's false-positive logo match was a hero placeholder labelled "ภาพประกอบงาน Finnomena Design Day 2026". After that run, `253080a` limited label matches to the brand name alone or with "logo", and added the hero and speaker-photo cases to the fixture. The agent's in-run line above is from `3ff5f3f`; the evaluator lines are from the fix. The Codex after build carries leads that Codex could not see: Chrome exited on SIGABRT in its run. The Codex sandbox as the cause is unverified.

Evidence (run.jsonl, reports, builds without `node_modules`, the agent's and the grader's screenshots) is under `.local/evals/58-codex-before`, `.local/evals/58-codex-after`, `.local/evals/58-claude-before` and `.local/evals/58-claude-after`.

Limits:
- One sample per cell, and a Haiku-class Claude model.
- Codex measured nothing in either revision, so the measured path is evidenced by one Claude run.
- Every build already passed the three Neon rules, so these samples show the runner reporting them, not catching a failure. Failures are covered only by the fixtures: no Plex face, a 404 Thai subset, a hidden logo and source-brand leaks.
- The fixtures' Plex face is a stand-in drawn from a local system font.
- These runs used a source-brand check that also scanned aria-label and body text. The check now scans only the title, meta content and alt text, as #58 asks, so a page that credits the reference in its body is no longer reported. The runs were not repeated after that change.
- The built starter shows no logo at 375px, where it has no header, so a starter-based page reports `no Finnomena logo` at that width.
- The before Claude Fail is not caused by this change. The `6c0a1f6` checklist already asked for the `Browser probe:` line, and that run never read verification.md. This change did not touch that routing. What this change adds is shown only by the after Claude run, which measured, acted on leads and cited the results.
- The `claude -p` runs inherited the user-level Claude setup: its hooks, the `swift-lsp` and built-in plugins, and probably the user-level instructions file. They still had no browser or MCP tools.
- Both Claude runs had `dontAsk` denials on compound read commands (`cd … &&` and variable assignments). The baseline also had a denied `( cd … )` subshell and two commands blocked by a user `no-cd` hook. Each run then read the same files with Read or simpler commands. No denial or block touched a browser or probe step.
- Both Codex runs list `/tmp/design-day-probe.js` as a new `/tmp` entry. Its origin is unclear, so it was left in place.
