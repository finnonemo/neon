---
scenarios:
  - request: Restyle a v0 shadcn app to Finnomena, with and without a browser tool
    observe: The report cites the shipped browser probe's results at 375px and 1440px, or says the probe was not run and marks those checks unverified.
---

# Browser probe in verification

The shared checklist's Measure step evaluates the shipped [browser-probe.js](../../../skills/neon-redesign/references/browser-probe.js) at 375px and 1440px when a browser tool can run JavaScript. Without such a tool, the run says the probe was not run, marks those checks unverified and gives the probe at both widths as the recheck. Fixture and request: the [shadcn on Tailwind v4 restyle](shadcn-on-tailwind-v4-restyle.md) above, verbatim.

Pass requires the report to cite the probe's per-width results, or to state that the probe was not run and name both widths as the recheck.

November 2026, Codex 0.162.1, run through `run-codex-case.mjs`. Codex has no browser tool, so these runs could exercise only the fallback. Every run read verification.md.

| Item | Before (main at `97ad7b4`) | After, first sample | After, second sample (report wording added) |
| --- | --- | --- | --- |
| Browser attempt | Tried to launch Chromium through a cached `playwright-core`; it failed | None | None |
| Report | "Browser checks were blocked by Chrome failing to launch." | "browser checks remain unverified"; an earlier message names 375px and 1440px | "Browser checks remain unverified"; "Recheck both modes at 375px and 1440px before release." |
| Probe named | No | No | No |
| Grader | Pass | Build not run: `npm ci` was interrupted | Pass |
| Verdict | Fail | Fail | Partial: unverified and both widths, probe not named |

A third sample moved the reporting rule into item 5 ("Name the browser probe's results per width, or state that it was not run…") and opened the Measure bullet with "whether or not a browser is available". It read verification.md, passed the grader and reported "Browser checks remain unverified; recheck both modes at 375px and 1440px", without naming the probe: Partial again. In every revised run the case runner found the plugin Codex installed identical to the package, so the probe reaches an installed host.

The evaluator then took the browser-available path with the shipped copy. `run-probe.mjs` evaluates the probe's text the way the Measure step asks. It ran on the Before build and the second After build at 375px and 1440px, light and `.dark`. `viewportWidth` matched each width, and both builds came back clean in every category. Limits: one sample of Before and three of After, each on a different wording, Codex only, the agent never ran the probe itself, and no sample named the probe in its report, so this case does not yet pass.

Review then removed "whether or not a browser is available" from the Measure bullet, which contradicted its fallback, and made the fallback name the probe as not run with both widths as the recheck. Two samples ran that wording in Claude Code 2.1.316 with the package loaded through `--plugin-dir`, and an evaluator-written MCP browser tool (navigate, resize, evaluate, screenshot, console) backed by headless Chromium. Permissions allowed file tools and the browser tool; the shell was denied in the first sample and limited to build, typecheck and listing commands in the second.

| Item | Claude, first sample (no app server) | Claude, second sample (dev server already running) |
| --- | --- | --- |
| Read verification.md | Yes | No: read style-migration.md, theme.css and readiness.md only |
| Browser attempt | Navigated to `localhost:5173`; connection refused | Before/after screenshots, light and dark, its own contrast and add/remove scripts at the default 1440px viewport |
| Probe evaluated | No | No; never resized to 375px |
| Report | "The layout and contrast measuring script (the skill's browser probe) was not run. Run it at 375px and 1440px." | Browser checks listed; "Not checked: the 375px mobile width, the browser console and a production build." |
| Verdict | Pass (fallback) | Fail: browser available, probe not evaluated or named |

The first sample is the only run so far to name the probe, on the fallback path. The second shows the browser path failing upstream of the Measure wording: the run skipped the shared checklist that SKILL.md step 5 links. Limits: one sample per condition, the browser tool and its MCP server are the evaluator's and stayed local, and the permission settings shaped what each run could do. The browser path has still not passed in an agent run, so this case does not pass.

The failing run had followed the two read conditions in SKILL.md that use a read verb or sit in Done: step 3's "read the Tailwind mapping rules … including on the fast path" and Done's readiness link. Step 5 only said "Verify with the shared checklist", and the fast path listed what to skip. Step 5 now says to read the checklist before reporting, on the fast path and for colors-only work. The fast path says it skips installation and audit, not verification. Done ties the report to checklist item 5. Two samples then reran the second sample's setup: same command, permissions, browser tool and dev server at 5173, each on a pristine copy of the fixture. The first ran the package from #66's head plus this change; the second ran main at `0a80f01` (#65 and #66 merged) plus this change. The two packages differ only in #65's item 4 motion wording.

| Item | Claude, third sample | Claude, fourth sample |
| --- | --- | --- |
| Read verification.md | Yes, second reference read, before editing | Yes, second reference read, before editing |
| Read browser-probe.js | Yes, after the first navigate | Yes, after the first navigate |
| Probe evaluated | The probe's code, comments stripped, at 1440px light and 375px dark; `viewportWidth` 1440 and 375 | The same code wrapped as `window.__probe`, at 1440px light and dark and 375px light and dark; `viewportWidth` 1440 and 375 |
| Report | "Probe at 1440px (light) and 375px (dark): no horizontal overflow and no fills that disappear into their background." Lists the probe at 1440px dark and 375px light as not run | "Nothing scrolls sideways at either width in either mode" and "nothing in the layout blends into its background"; does not use the word "probe" |
| Grader | Pass | Pass |
| Verdict | Pass | Partial: probe read and evaluated at both widths, but its results are not named per width or attributed to the probe |

The fourth sample also reported, from its 375px screenshot, rows whose codes overlap their badges and a Remove button past the card edge. The probe came back clean at 375px because it does not detect content overflowing a fixed-width container. Neither run tried the allowed `npm run build`; each had a listing command denied first and reported the shell as blocked, so the build result is the grader's. Reads, resizes, evaluations and `viewportWidth` were graded from the tool calls and results in each run's `run.jsonl`. Limits: two samples, Claude Code only, the evaluator's MCP browser tool, and no rerun of the fallback path or of Codex with this change. Both runs now read the checklist and evaluate the probe at both widths. Naming the results per width passed once and was partial once, so report-time naming under item 5 remains open, as on Codex.

Item 5 now gives the probe a fixed report line: `Browser probe: 375px …; 1440px …`, or `Browser probe: not run; recheck at 375px and 1440px`. Two more samples reran the third and fourth samples' setup in Claude Code 2.1.316 on main at `be33675` (#68 merged) plus this change: same command, permissions, browser tool and dev server at 5173, run one after the other, each on a pristine fixture copy and a package matching `skills/`.

| Item | Claude, fifth sample | Claude, sixth sample |
| --- | --- | --- |
| Read verification.md | Yes, second reference read, before editing | Yes, second reference read, before editing |
| Read browser-probe.js | Yes, after editing | Yes, after editing |
| Probe evaluated | The probe's code with a geometry field added to its result, at 1440px light; then a rewrite with shorter names and extra fields as `window.__probe`, at 1440px dark and 375px light and dark; `viewportWidth` 1440 and 375 | The probe's code, unchanged but for one trailing comma, wrapped as `window.__probe`, at 1440px light and dark and 375px light and dark; `viewportWidth` 1440 and 375 |
| Report | "**Browser probe:** 375px clean in light and dark; 1440px clean in light and dark (no overflow, no blended fills, no unreadable controls)." | "Browser probe: 375px clean in light and dark (…); 1440px clean in light, and no overflow in dark." |
| Build | Ran `npm run build`: passed | Not tried: a first listing command was denied and the run reported the shell as blocked |
| Grader | Pass | Pass |
| Verdict | Pass | Pass |

Both reports also gave the 375px row overlap from screenshots, which the probe does not detect, as above. The fifth sample's own `npx vite` was denied and it measured the evaluator's server. Its 1440px dark and 375px results came from its own rewrite of the probe, not the file's text, so it followed Measure only in part. Limits: two samples, Claude Code only, the evaluator's MCP browser tool, and no Codex rerun. Both runs adopted the line shape, so report-time naming passed here, but two samples cannot show it holds. Codex has not run this wording; none of its four runs above, three of them on revised wording, named the probe.

neon-create step 5 now says to read the checklist before reporting, on the fast path too, and Done ties the report to item 5. Two Claude Code samples ran the [Sample figures](sample-figures.md) request verbatim as `/neon:neon-create` into a `.gitkeep`-only folder, with the same plugin and browser tool. Their permissions were broader than the restyle samples': `node`, `npm`, `npx`, `mkdir` and listing commands, and in the second also `cat`, `head`, `cd`, `grep` and `git status`/`ls-files`. Each run's first shell command was a compound that included an unlisted command (`git status`; `pwd` and `git log`). It was denied, and the run reported Bash as blocked. Neither run tried the allowed installer, `npm install` or a dev server: each assembled the starter by hand from the package's template, and neither opened the browser. Both read verification.md, after scaffold.md, which also links it, so the read cannot be attributed to step 5 alone, and no sample ran the old step 5 wording for comparison. Neither read browser-probe.js. Both reports said "Browser probe: not run; recheck at 375px and 1440px." and marked the build, rendered layout and console unverified. Fallback naming passed in both. The neon-create browser path is unexercised: the probe was never evaluated, and nothing was built or rendered for grading.
