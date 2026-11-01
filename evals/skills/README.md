# Skill behavior scenarios

Run each request with the named context, first against the baseline and then the revised skill. Record the revision, prompt, supplied files, agent decisions, changed files and actual checks. Use an isolated app for implementation runs. Do not supply the expected answer to a fresh evaluating agent.

| Request/context | Observe |
| --- | --- |
| Add Finnomena approvals to an existing themed React/CDS app; retain providers/routes/services | Reuses installation and shell; builds actual list/detail/actions; navy foundation, indigo selection, labeled statuses |
| Build a colorful Finnomena product landing page | Picks an Immersive Theme; sets `data-immersive-theme` and colors only through `--immersive-*`; text only White or Navy; no gradients; a visible theme toggle on the review build; actions remain accessible |
| Follow-up on a themed page: "ขอ theme พื้นขาว" | Switches to Club by the one attribute; layout and content unchanged |
| Follow-up on a themed page: "ใส่สีเขียวเป็น highlight" | Uses `--immersive-green-*` with its `on-green-*` text in a small block; theme canvas and action unchanged |
| Create a Finnomena request tracker with mock data | Scaffolds in an empty destination and builds the feature; no demo/mock banner or state switcher in the UI; the report names what is mocked; relevant states exist |
| Build a Finnomena request tracker demo with mock data, labeled as a demo | Demo/mock labeling appears in the UI |
| Change only a Vue header to Finnomena colors | No React/CDS installation, font/layout changes or global theme side effects |
| Review this Finnomena screenshot; do not edit | Visible findings only; keyboard, other viewports and measured contrast remain unverified |
| Make the buttons clearer after Finnomena was established | Retains brand intent without repeated onboarding |
| Build a CDS settings screen with no Finnomena context | Does not infer Finnomena branding from CDS alone |
| Build a Finnomena event landing page from an attached Refero reference design | Starts at Blended without asking; keeps reference geometry; Finnomena palette, IBM Plex Sans Thai and logo; no source-brand name, copy or imagery; offers the dial |
| Build a Finnomena landing page from a reference design whose hero uses a multi-hue gradient | Keeps the gradient's placement and direction; its stops become a gradient recipe from `theme/tokens/colors.json`; no reference hue survives; hero text is readable at every stop beneath it |
| Follow-up: "ให้ดู finnomena มากขึ้น" | Moves exactly one level toward Finnomena-led; content, flow and composition unchanged |
| Follow-up: "use the reference's own colors and font" at Reference-led | Stays at Reference-led and explains the Brand Floor; reference colors may stay with at least one Finnomena color; no source font |
| Reference-led dark immersive event page; follow-up "change the yellow CTA to a white button" | White action with a dark label; no navy or yellow forced back; IBM Plex Sans Thai and at least one Finnomena color remain; the shared theme mapping is untouched |
| Back office screen; "make the primary button white" | Functional contract: primary action stays navy; explains that white actions are for immersive surfaces |
| Review a Reference-led immersive page with a white CTA and no navy or yellow | No off-brand finding for the action or palette; contrast is still checked |
| Build an immersive campaign dashboard "in this style" from one screenshot, no stated target | Shows 2–3 static directions before building; saves the screenshot with a note; builds only the picked direction |
| Follow-up after a rejected build: "ยังไม่ใช่ที่ต้องการ" | Returns to 2–3 directions rather than another full rebuild |
| Attach a reference design to a back office screen request | Functional contract; takes at most section structure; does not offer the dial |
| Campaign page promoting a fund with return figures | Brand-ready; labeled disclaimer placeholder; no drafted regulatory wording or invented figures |
| Recruiting page with a sign-up form and no named form service | Asks for the approved service; without one, no invented endpoint; Brand-ready |
| Event page with no forms or investment content | Ship-ready even with failed or unverified checklist items, which are listed as the employee's pre-launch to-dos; static build; does not deploy. See [Readiness](#readiness) |
| Blended event page from a motion-heavy reference design | Under reduced motion every section is visible, no content waits on a reveal script, and the heading is readable at first paint; Ship-ready checklist evidence names the production preview for 375px and 1440px. See [Motion safety](#motion-safety) |
| Build a Finnomena recruiting event page (date, place and link supplied; employee quotes and partner logos asked for but not supplied) | The report lists the claims; date and place appear on the first screen at 375px; no headline wraps past two rendered lines at 375 or 1440; no invented quotes, logos, counts or returns, and sample content is a pre-launch to-do. See [Campaign Page content](#campaign-page-content) |
| Colors-only restyle of a Tailwind v4 app that uses stock utilities only | See [Tailwind colors-only regression](#tailwind-colors-only-regression) |
| Restyle a v0 shadcn app to Finnomena, with and without a browser tool | The report cites the shipped browser probe's results at 375px and 1440px, or says the probe was not run and marks those checks unverified. See [Browser probe in verification](#browser-probe-in-verification) |
| Restyle a v0/Lovable React + Tailwind v4 + shadcn project to Finnomena | Detects shadcn on v4; edits `:root`/`.dark` by role and pair; leaves `@theme inline`; installs no CDS. See [shadcn on Tailwind v4 restyle](#shadcn-on-tailwind-v4-restyle) |
| Rebuild an existing React prototype on CDS; colors-only and feature requests on the same apps | See [CDS rebuild](#cds-rebuild) |
| Build a Back Office fee-report screen with mock data | Totals equal the sum of rows; numbers right-aligned with tabular figures; a fall in fees takes the color of its declared good direction; a zero prints as `0`; sample values appear in the Handoff Summary. See [Sample figures](#sample-figures) |
| Build a Finnomena request tracker | At 1440×900 the list (heading and at least three complete rows) and the add-request action are visible on load; a request's detail is reachable in one click. See [First screen](#first-screen) |
| Build a Back Office fee-report screen with mock data (first screen) | At 1440×900 the per-fund table shows its heading and at least three complete rows on load, with no summary band repeating totals the table carries. See [First screen](#first-screen) |
| Add Finnomena approvals to an existing themed React/CDS app (Look and fix) | Before Done the run screenshots its screen at 375px and 1440px, writes at least one critique round naming the widths and applies fixes; the report gives each round its own line and no numeric score. See [Look and fix](#look-and-fix) |
| Build a Finnomena event page from a Reference Design, with no browser tool | The report cites `scripts/probe-page.mjs` results at 375px and 1440px: IBM Plex Sans Thai loaded for Thai and Latin text, the Finnomena logo present, the source brand absent; where Chrome cannot launch, the runner's `not run` line. See [Browser probe runner](#browser-probe-runner) |
| Colors-only restyle of a Tailwind v4 app whose disabled text must keep a stock utility | The run executes the shipped source lint on its changed files and the report fixes or justifies each warning on a `Source lint:` line. See [Source lint](#source-lint) |
| Review this Finnomena back office screenshot (generated-dashboard habits, Neon navy and indigo present) | Findings name habit rows with visible evidence and give CDS or composition fixes; Neon navy structure and indigo links are not flagged as habits; no file edited. See [Functional screen habits](#functional-screen-habits) |
| Finnomena fund-fee table at 375px | Below about 640px each fund is a two-line row (identity and key figure, then labeled secondary fields); every value shown at 1440px is visible at 375px; no sideways-scrolling table. See [Functional screen habits](#functional-screen-habits) |
| Add Finnomena approvals to an existing themed React/CDS app (readiness) | The report says Brand-ready with a Handoff Summary: a Back Office screen is never Ship-ready, with or without a mock service. Open: [Look and fix](#look-and-fix) Revised-2 reported "Ship-ready, apart from the mock service"; unverified since |
| Add Finnomena approvals to an existing themed React/CDS app (critique shape) | Each Look and fix round's critique, in the run's messages, gives every finding as severity, location, evidence with width and state, who is affected, fix and recheck. Open: no revised run in [Look and fix](#look-and-fix) used this shape; unverified since |
| Finnomena event page and Back Office approvals screen, baseline against revised skills (blind) | A judge who cannot tell the packages apart prefers one output per pair, or neither, at 375px and 1440px and names problems with the Look and fix questions and habits table; no numeric score; never feeds readiness. See [Output quality (blind)](#output-quality-blind) |

Verdicts are pass, fail or unverified for routing, scope, resource retrieval, component correctness, color roles, feature completion, responsive behavior and evidence honesty. Link actual artifacts. Do not turn a successful retrieval simulation into a claim that an app was built or looked better.

## Run harness

Codex cases run through `run-codex-case.mjs`. Claude Code cases use the same allowlist and harness note for every arm, so baseline and revised differ only in the package:

- Command: `claude -p --model <model> --setting-sources project,local --plugin-dir <package> --add-dir <package> --mcp-config <browser> --strict-mcp-config --permission-mode dontAsk --output-format stream-json --verbose --allowedTools <allowlist> --append-system-prompt <note>`. `--setting-sources project,local` leaves out the evaluator's user hooks.
- Allowlist: `Read Edit Write Glob Grep Skill`, the browser tools, and `Bash(…:*)` for `ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx sips file python3`, `npm run`, `git status/log/diff/ls-files/rev-parse/show/branch`.
- Note, verbatim: "Shell permissions in this session: Bash is allowed for commands that start with one of: ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx sips file python3, npm run, git status, git log, git diff, git ls-files, git rev-parse, git show, git branch. A denied command blocks only that command; the shell stays available for allowed commands. Variable assignments, loops and $(...) substitutions are always denied, so run each command on its own, with literal paths."

After each run, `node evals/skills/check-run.mjs <run.jsonl>` lists its denied commands and marks the run VOID when it then reported the shell as blocked. Check the first run before starting the rest, and widen the allowlist for any denial a prefix can cover. A void run is rerun, not graded; record every denied command either way.

## September 2026 refactor evidence

Baseline retrieval evaluation found missing canonical guide links, an unconditional installer step despite reuse guidance, global CSS-import risk for partial restyles, and a literal-color example conflicting with token reuse. The remaining immersive overlay required yellow-led branding contrary to the current product brief.

A packaging reproduction reported success while its promised functional guide was absent. Two executable regression tests failed before the packaging fix, then passed: required design resources ship, and missing required payloads reject before writing output.

The revised skills use one shipped product contract, a shorter creation entrypoint with conditional setup references, and scoped CSS integration. Source and packaged resource checks run via `scripts/check-repository.mjs`. The independent follow-up evaluates retrieval and decisions only; no newly generated app or visual preference benchmark is claimed by this refactor.

## Tailwind colors-only regression

Fixture: a Vite/React app whose CSS is only `@import "tailwindcss";`, styled with stock utilities (`slate-*` text and surfaces, pale `-200` status borders, `focus:border-blue-*` inputs, colored category dots). The local batch-sell calculator reference matches. Request, verbatim:

> $neon-redesign Colors only: switch this app's colors to Finnomena colors. Keep the layout, components, spacing and behaviour exactly as they are.

October 2026 baseline (Codex, one sample) built but failed the other items below: it skipped the style migration reference, aliased `--color-slate-*`/`--color-blue-*` in `@theme inline`, mapped `text-slate-300` to `bgLineHeavy` and `border-green-200` to `bgPositive`, collapsed `slate-400/500/600` to `fgMuted`, recolored category dots and tried an `input:focus` palette override that never applies.

Pass requires all of:

- The run reads the Tailwind mapping rules in the style migration reference before editing.
- No stock palette name (`--color-slate-*`, `--color-white`, …) is redefined in `@theme` or `:root`.
- Every changed `text-*` utility resolves to an `fg*` token; `bg*` and `bgLine*` tokens appear only on surfaces and borders.
- Pale borders and washes stay pale (wash/`accentSubtle*` token or the original utility); no saturated status token replaces a `-50`–`-200` shade.
- Focus color, if changed, uses a `focus:` variant at the call site.
- Category dots keep distinct meanings or are reported; geometry, fonts and handlers are unchanged and the build passes.
- Text lighter than `fgMuted` (disabled, inactive icons) stays light; a selected state keeps an indigo signal.
- Brand colors reference adapter variables (`var(--color-bgLinePrimary)`), not hex values copied from `theme/tokens/colors.json` or a worked example.

Revised skill, Codex, same prompt and fixture, one sample per revision. The first revision passed the read, alias, role, pale-shade, focus and build items, but darkened disabled `slate-200/300` text to `fgMuted`, made the selected tab navy-only and collapsed three section dots to navy. After the state and marker rules were added, a second sample passed every item; desktop light-mode screenshots matched the source findings. Limits: two single samples, Codex only, light mode and one desktop width, no handler interaction, and user-level skills outside `CODEX_HOME` were visible to every run.

The same colors-only prompt invoked as `$neon-create` on this fixture and on a Carbon/SCSS app (Codex, one sample each) stayed in scope and built. Both runs wrote literal indigo `#1817e7` where the adapter maps focus to `bgLinePrimary`. The Tailwind run cited style migration Example 4, which then gave literal hex values; the example now uses adapter variables. Two later samples (see [CDS rebuild](#cds-rebuild)) used `var(--color-*)` utilities without `#1817e7`; one imported the adapter, the other copied its `rgb()` declarations into `:root`.

## shadcn on Tailwind v4 restyle

Fixture: [fixtures/shadcn-v4-app](fixtures/shadcn-v4-app), a Vite/React app in current shadcn/ui v4 form: `@import "tailwindcss"`, `@custom-variant dark`, the default neutral `:root`/`.dark` values and `@theme inline` mapping (its radius lines use the older `calc(var(--radius) - 4px)` form), a `components.json`, and the registry's `button`, `input`, `card` and `badge` with `asChild` removed. The page has primary, outline, ghost and destructive buttons, an input, secondary and outline badges on cards, `text-destructive` text, `chart-1`–`chart-5` dots and a toggle that sets `.dark` on `<html>`. Request, verbatim:

> $neon-redesign I built this app with v0. Switch it to Finnomena colors, in light and dark mode. Colors only: keep the layout, components, spacing and behaviour exactly as they are.

Pass requires all of:

- `@theme inline` is byte-identical; no `tailwind.config.*`, CDS package or component edit is added.
- Each changed role changes with its `-foreground`, in `:root` and `.dark`.
- The primary label is at least 4.5:1 in both modes, measured with `.dark` toggled.
- `--ring` resolves to the indigo `bgLinePrimary` in both modes; `--accent` is a neutral surface.
- Secondary badge fills and ghost hovers differ from the card they sit on, in both modes.
- `--chart-*` and `--radius` are unchanged; the build passes.

October 2026, Codex 0.162.1, one sample per revision, run through `run-codex-case.mjs`. Every run read SKILL.md, style migration, verification and INSTRUCTION.md. The evaluator built each result and measured it in headless Chromium, light and `.dark`, at 1024px. The first revision used the adapter's `bgSecondary` for `--secondary`, `--muted` and `--accent` in both modes; the second maps them to `bgTertiary` in dark.

| Item | Before (main at `e1c1d1c`) | First revision | Second revision |
| --- | --- | --- | --- |
| Files changed | `index.css` values plus a new `finnomena-colors.css`: the adapter's color declarations copied under `:root` and `.dark`, referenced as `var(--color-*)` | `index.css` values only, converted to `oklch(...)` with alpha kept | Same as first |
| `@theme inline`, components, `--chart-*`, `--radius` | Unchanged | Unchanged | Unchanged |
| Primary, light / dark | Navy, white label 18.12:1 / `#415160`, white label 8.17:1 | Same | Same |
| Destructive button, light / dark | 5.39:1 / 8.44:1 | Same | Same |
| Focus border, both modes | `rgb(105, 104, 239)` | Same, as `oklch` | Same, as `oklch` |
| Dark secondary badge on its `#1a1a1a` card | `#1a1a1a`, no visible pill | `#1a1a1a`, no visible pill | `#262626` |
| Dark ghost hover | `bgSecondaryWash` at 50%, barely darker than the card | Same value as the card, no visible hover | `bgTertiary` at 50% |
| Reported gaps | None | Input outlines have low contrast | Dark `text-destructive` at 4.02:1 |
| Verdict | Fail: card surfaces | Fail: card surfaces | Pass |

On the original items main already passed: its format sections and the adapter were enough for pairs, the dark primary label, focus, charts and radius on this fixture. The difference is the card-surface item, which both earlier runs failed and the second revision passed, and the value format, which follows the file. Unreported by any run: input outlines measure 1.12:1 (light) and 1.62:1 (dark) against the card, against the stock fixture's 1.26:1 and 1.60:1. Limits: one sample per revision, Codex only, one desktop width, a synthetic fixture rather than a real v0 or Lovable export, no sidebar or chart component rendered, and Codex's own browser checks were unavailable. The second revision's run predates only a rewrap of the format 4 paragraph.

Grading: `node evals/skills/grade-restyle.mjs --source <fixture> --result <case>/shadcn-v4-app` checks the first and last pass items: only stylesheets changed, `@theme inline` byte-identical, `--chart-*` and `--radius` kept, build passes. Add `--shots <name>` to also build the result into `.local/shots/<name>`, then run `node evals/skills/run-probe.mjs <name> --widths 1024 --dark-class`. That run reports badges and other rounded fills that blend into their card as `sameFill`, and controls on dark fills under `lowContrast`. Run again without `--dark-class` for light. Pairs, `--ring`, `--accent` and ghost hovers stay manual. On the three runs above, the grader passed all four checks for each. The dark probe flagged both secondary badges at 1:1 for Before and the first revision, and nothing for the second; no run had low-contrast controls. The stock fixture's light secondary badge reads 1.09:1.

## Browser probe in verification

The shared checklist's Measure step evaluates the shipped [browser-probe.js](../../skills/neon-redesign/references/browser-probe.js) at 375px and 1440px when a browser tool can run JavaScript. Without such a tool, the run says the probe was not run, marks those checks unverified and gives the probe at both widths as the recheck. Fixture and request: the [shadcn on Tailwind v4 restyle](#shadcn-on-tailwind-v4-restyle) above, verbatim.

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

neon-create step 5 now says to read the checklist before reporting, on the fast path too, and Done ties the report to item 5. Two Claude Code samples ran the [Sample figures](#sample-figures) request verbatim as `/neon:neon-create` into a `.gitkeep`-only folder, with the same plugin and browser tool. Their permissions were broader than the restyle samples': `node`, `npm`, `npx`, `mkdir` and listing commands, and in the second also `cat`, `head`, `cd`, `grep` and `git status`/`ls-files`. Each run's first shell command was a compound that included an unlisted command (`git status`; `pwd` and `git log`). It was denied, and the run reported Bash as blocked. Neither run tried the allowed installer, `npm install` or a dev server: each assembled the starter by hand from the package's template, and neither opened the browser. Both read verification.md, after scaffold.md, which also links it, so the read cannot be attributed to step 5 alone, and no sample ran the old step 5 wording for comparison. Neither read browser-probe.js. Both reports said "Browser probe: not run; recheck at 375px and 1440px." and marked the build, rendered layout and console unverified. Fallback naming passed in both. The neon-create browser path is unexercised: the probe was never evaluated, and nothing was built or rendered for grading.

## Mock labeling

Fixture: an empty folder. Request, verbatim:

> $neon-create Create a Finnomena request tracker app in this folder: a list of requests with status, a detail view, and a form to add a request. There is no backend yet, so use mock data.

Pass requires no demo or mock banner, chip or state switcher in the UI, and a delivery report that names what is mocked.

October 2026, Codex, one sample per revision, run in parallel:

- **Before (main at 1d35395):** the sidebar showed "Demo workspace · Mock data · Session only", the form footer "Created in this demo session only." and the list footer a "Mock data" chip. The report said "visibly labeled mock data". Fail.
- **After (this revision):** no demo or mock text in the UI source. The report said "Mock data resets on refresh." Pass.

Both built and typechecked. Limits: one sample per revision, Codex only, source text inspected rather than rendered screens, browser verification was blocked by the sandbox, and the explicit demo request in the scenario table was not run.

## CDS rebuild

Fixtures: the batch-sell calculator above and a health-check management prototype (React, `@carbon/react`, SCSS, mock data with a timed demo transition). Rebuild request, verbatim, run in each source app:

> $neon-create Rebuild this app on CDS with the Finnomena starter. Keep every screen, feature, filter and the Thai/English text working.

Pass requires all of:

- The run reads the rebuild reference and writes a parity inventory before building.
- The starter is assembled into a new empty directory; the source app has no changes.
- Mock data, services and pure logic are copied with unchanged behavior; copied tests pass.
- The rebuild has no source UI library import, package or class; each retained non-UI library is reported.
- Every inventory item is observed in the rebuild at 375px and desktop, or reported as not ported.
- The build passes; the light scheme is checked and dark mode is reported as unverified unless wired.
- Primary CDS buttons keep `fgInverse` text. Every stylesheet selector starts with an app class, and no rule reaches into CDS components (`stylesheet-scope.mjs --src <app>/src`).

Run a case with `node evals/skills/run-codex-case.mjs --fixture <app> --case <name> --prompt "<request>"`. It installs the packaged plugin into a private Codex home and checks the installed copy against the package. It gives Codex its own `HOME` and `TMPDIR`; in a check run Codex listed only its built-in and `neon:` skills, with no user-level `ponytail`. Codex still writes to the real `/tmp`: by their logs, hc-s1, hc-s3 and bs-s2 of the re-sample left files there, the scripts named after the fixtures (`/tmp/rebuild-hc.py`, `/tmp/check-batch-parity.cjs`), so delete them before the next run. It retries capacity failures (that path is untested) and deletes the copied `auth.json` on exit. The `authRemoved` field in `summary.json` scans the whole root, so cases running at the same time report each other's live copy as leftover. After all cases finish, check with `find <root> -name auth.json`. Then run `node evals/skills/grade-rebuild.mjs --source <case>/<app> --rebuild <case>/<app>-cds --shots <name>`, which prints pass or FAIL for the source, stylesheet, test, typecheck, build and mock data items, and for source UI libraries in packages and imports (leftover library classes stay a manual check). The CDS-component half of the stylesheet check has flagged only synthetic cases so far; none of the recorded runs put a class on a non-layout CDS component. To record which skill files a case read, run `node evals/skills/reference-reads.mjs <case>...`: it expands brace paths and counts a file as read only when its lines appear in the command output, so a path that is only named, as in `ls`, reads as "named only".

`--shots` builds into `.local/shots`, copies the probe there and adds the `eval-shots` preview server. In the browser, run `eval(await (await fetch('/browser-probe.js')).text())` at 375px and desktop. A hidden pane lays out at width 0. Viewport emulation (`resize_window` at 375×812 and 1440×900) measured true widths even with the pane hidden, so check `viewportWidth` either way. The probe ships with the skills as [browser-probe.js](../../skills/neon-redesign/references/browser-probe.js), which the shared verification checklist's Measure step evaluates; these evals use that copy. It reports page overflow, content scrolled sideways at load, sideways-scrolling containers, text counts per font, contrast on dark-background controls, rounded fills within 1.1:1 of what is behind them with no border or shadow (`sameAsParentFill`), nav underlines and dialog fit, naming each element measured. Colors are composited on a canvas, so `oklch()` and translucent fills measure as drawn; until 27 October contrast read `oklch()` channels as `rgb()` and put shadcn v4 controls at 1:1. On the recorded health-check samples at 375px it flagged the first sample's black "Home" label on navy (1.16:1), the sideways-scrolling columns of the second and fourth, and the third's underlined bottom nav; the fifth came back clean. Serif detection was first checked only against an unstyled element injected into the third sample's page, whose `<body>` computes to `Times`; the headless run below found r3's real desktop nav labels in `Times`. Content overflowing a fixed-width container, such as r2's nav labels past the rail, is not detected. Contrast is read from the control's own `color`, only for controls with text or an SVG icon; nav underlines count only on links with text. Before this rule, bs-s5's empty gauge-dot buttons read 1:1 and the starter's image-only Logo link read as an underlined nav link. With both rules, the probe at 375px still flagged r1 to r4 as above, since r3's icon-font glyphs count as text. It also found r2 and r4 loaded already scrolled sideways, by 30px and 52px. On the re-sample's hc-s1 and hc-s3, icon-only bottom nav links read 1.93:1 (default link blue on navy) while their glyphs render white. Inventory items, interactions and dialogs stay manual.

Without the preview pane, `node evals/skills/run-probe.mjs` serves each build in `.local/shots` and runs the probe in headless Chromium at 375px and 1440px in light mode, printing one line per build and width (`--json` for the full result, names to limit the builds). `--scheme dark` sets `prefers-color-scheme`, and `--dark-class` adds `dark` to `<html>` after load. It uses Playwright from `evals/templates`, so run `npm ci --prefix evals/templates` first. `--fixture` checks the probe against [probe-fixture.html](probe-fixture.html), whose expected ids cover each filter above, and whose expected contrast values catch a misread color, in light and again with both dark switches; the template-browser workflow runs it whenever the probe changes, then grades the unmodified restyle fixture as its own result and probes it with `--dark-class`. On 27 October the headless run repeated the 375px results above for r1 to r5 and bs-s4 to s6, including r2's 30px and r4's 52px scroll. At 1440px it found five of r3's side-nav labels in `Times` ("Home", "Search", "Analytics", "Insights", "Notifications"), which the evaluator confirmed in the preview pane; the r1 to r5 results recorded above were measured at 375px only.

Control requests on the same fixtures must keep the existing stack: `$neon-create Colors only: switch this app's colors to Finnomena colors. Keep the layout, components, spacing and behaviour exactly as they are.` on both, and on health-check the status-filter task from the [flow refactor protocol](flow-refactor-protocol.md) adapted to its statuses: `$neon-create Add a Finnomena status filter to this existing customer list. Offer All, New, In Progress, Ready to Report, Completed; combine it with the existing search, show an empty message when nothing matches, preserve services, providers, theme, routes and detail behavior. Keep Thai/English text usable on mobile and desktop.`

October 2026, Codex, one sample per case:

- Both rebuilds read the rebuild reference, wrote a parity inventory with source locations, assembled `<app>-cds` with the installer and left the source unchanged. Mock data (byte-identical once its type annotation is removed) and the calculator logic were copied unchanged. Neither source had tests, so each run added its own (batch-sell 7, health-check 16); all pass, as do strict TypeScript and the build. No Carbon or Tailwind remains. Batch-sell reported the retained `@vercel/analytics`. Health-check reported a search control it added and the source's inert navigation and mock actions.
- Browser checks were done by the evaluator, in light mode at desktop and 375px, because Codex could not launch Chromium in its sandbox. The batch-sell content, quick-select calculation and narrow stacking matched the source. On health-check, the dashboard counts, drilldowns and search list matched. Two defects were found:
  - Its stylesheet's unlayered `button { color: inherit }` beat CDS's `cds` cascade layer and turned primary button text dark on navy.
  - The search panel extends 32px under the sidebar.
  CDS integration now says to scope app styles to app classes, and the rebuild reference links to that rule. A health-check re-run on that revision (one sample) passed:
  - Every rule sits under `.phc-app`.
  - Primary buttons in the page and the Add Asset dialog render white on navy.
  - Search is inline in the dashboard column, clear of the rail.
  - The 17 tests and the build pass.
  - The mock data matches the source in value.
  At 375px it regressed where the first sample had not:
  - The column starts 27px under the 72px rail.
  - `.phc-nav-items button { font-size: 0 }` leaves CDS labels at 17px, so they overflow the rail.
  The source and the first sample both lay out correctly at that width.
  CDS integration now also says to style CDS components through props. A third health-check sample (one sample) passed:
  - Every rule sits on app classes. The only element selectors (`table`, `th`) sit under an app-owned raw table; no rule reaches into CDS.
  - The primary "Create Portfolio" button renders white on navy at 375px. No dialog was opened.
  - 375px and desktop show no horizontal overflow; 375px uses the starter's bottom nav.
  - Search filters inline in its column.
  - 7 tests and the build pass; the mock data matches in value.
  It surfaced two starter gaps:
  - Nothing sets a root font, so bare `<Text>` renders in the browser serif. That covers at least 11 uses in the rebuild plus the starter's own `SidebarNav` labels. The earlier samples had set the font on `body` or `.phc-app`.
  - `BottomNav` links keep the browser's link underline.
  The starter now applies the theme's body typography to `<body>` from `AppRoot`, which also covers CDS portals, and `BottomNav` clears the underline. `starter-typography.test.mjs` guards both statically. A disposable assembled app confirmed the fix in light mode, with the IBM Plex Sans Thai face loaded:
  - A bare `Text`, a `Text` inside a CDS `Modal`, and the sidebar labels resolve to IBM Plex Sans Thai.
  - `BottomNav` links have no underline at 375px.
  - Desktop geometry matches the previous starter.
  The starter now also paints `<body>` with the active scheme's theme `bg`/`fg` and declares `color-scheme`. Before this, a dark OS preference showed a dark canvas behind black text. With dark-preference emulation, the disposable app rendered a white body with `fg` text at 375px and desktop, including inside the modal; light mode was unchanged. The starter's dark scheme itself stays unwired and unverified.
  At 375px the KPI pill buttons wrap to two lines. The run also upgraded Vite 5→8 and plugin-react 4→6 to add Vitest, and reported it.
  A fourth health-check sample, on the props rule plus both starter fixes (one sample), failed the stylesheet item:
  - `app.css` has bare element rules (`body`, `h1`, `h2`, `h5`, and `h2, h3, h4, h5, p`), and `.password-field > div` sizes the CDS `TextInput` root.
  - It passed the other checked items:
    - It read the rebuild, scaffold and CDS integration references, and the source was unchanged.
    - 13 tests, `tsc` and the build pass.
    - It kept Vite 5, and no Carbon or Tailwind remains.
    - The mock data matches in value.
    - Body text resolves to IBM Plex Sans Thai on a white body.
    - The two primary-styled buttons checked (the Home nav item and the add-column icon button) render white on navy. No labelled primary action or dialog was checked.
    - Search filters inline and shows its empty message.
    - Desktop has no overflow.
  - At 375px the page has no horizontal overflow. The app mounts its own `app-navigation` (`src/ui.tsx`) and no starter layout, so no bottom nav renders, and that nav scrolls horizontally. Its column container also scrolls sideways: a 320px-minimum column plus an add-column zone loaded scrolled 52px, which clipped the heading's left edge. The source was not compared at that width.
  CDS integration now says every selector starts with an app class, typography goes through `Text`/`Box` props, and a selector stops at elements the app renders itself. `stylesheet-scope.mjs` grades that shape and flags r4's rules. A fifth health-check sample (one sample) passed:
  - It read the rebuild, CDS integration and scaffold references, wrote a parity inventory, and left the source unchanged.
  - Its one stylesheet, `health.css` (97 lines), passes the grader: every selector is an app class, with no element selectors.
  - 10 tests, `tsc` and the build pass. It kept the starter's Vite 5, and no Carbon remains. The mock data matches in every export.
  - Desktop and 375px show no horizontal overflow and no sideways-scrolling container. All text resolves to IBM Plex Sans Thai on a white body.
  - Search filters the customer list ("James" → 1 customer) at desktop, and its input fits at 375px.
  - The labelled primary "+ Add Column" and the Set Password dialog's "Confirm Access" render white on navy. The dialog fits 375px.
  The browser check covered the dashboard, search and one dialog, not every parity inventory item. It mounts the starter's `SimpleLayout` with an empty `navigation`, so no bottom nav renders at 375px. Home and Search sit in its header there, and per its inventory Menu reaches the other labels; Analytics, Insights and Notifications have no source screen and are reported as disabled. Menu was not opened.
- Controls kept their stacks. The health-check colors run bridged Carbon `--cds-*` variables with hex values; the status-filter run changed only `App.jsx` and `App.scss`, and its filter UI was not browser-checked. The batch-sell colors run skipped neon-redesign and aliased stock palette names with hex. After neon-create's entrypoint sent colors-only React restyles to neon-redesign, two more samples read style migration and passed the alias, role, focus and build items above. Each mapped the selected tab border to indigo. On the pale and marker items, one sample passed. The other failed: it turned a `bg-slate-400` hairline into the near-white `bgPrimaryWash`. On adapter variables, that second sample passed by importing the adapter. The first is borderline: it copied the adapter's `rgb()` declarations into `:root`. Neither sample was browser-checked.
- Limits:
  - Single samples, Codex only. The re-sample below adds three per fixture, still Codex only.
  - The user-level `ponytail` skill leaked into every run before the case runner existed. No re-sample run mentions it.
  - Four first-round runs could list their `CODEX_HOME` through `--add-dir`.
  - Dark mode is unverified, because the starter fixes light.
  - Dialogs, timers and keyboard focus in the rebuilds were checked only through the runs' DOM tests.

### Re-sample, 26 October 2026

Same request and fixtures. Three samples per fixture through `run-codex-case.mjs` and `grade-rebuild.mjs`, Codex 0.162.1, skills as of `1d2e33a`. Since r5, neon-create and the starter are unchanged; the installer was refactored and runs now go through the case runner. The two fixtures ran concurrently, one sample after another. Every sample passed source unchanged, no source UI library, typecheck and build. Health-check passed mock data. Batch-sell has no mock files, and only the runs' own tests check its copied logic. No Carbon class (`cds--`, `bx--`) or Tailwind class string remains, and every sample kept the starter's Vite 5. The evaluator ran the probe on each landing screen in light mode at 375px and 1440px. Inventory items, interactions and dialogs were not checked, so no sample is a full pass.

| Sample | Read CDS integration | Grader | 375px | 1440px | Primary-styled buttons |
| --- | --- | --- | --- | --- | --- |
| hc-s1 | yes | FAIL stylesheet: `.phc-card > div` | Column container scrolls sideways (423/375), loads at `scrollLeft` 48 | Clean | None on the landing screen |
| hc-s2 | yes | pass | Column container 441/375, `scrollLeft` 66 | Clean | Home pill and `+` add column, white on navy (18.12:1) |
| hc-s3 | yes | pass | Column container 387/375, `scrollLeft` 12 | Clean | None on the landing screen |
| bs-s1 | yes | pass | Page 1882px wide | Page 2527px wide | `Current W.` and `Add Fund` white on navy at 375px (15.46–18.12:1) |
| bs-s2 | yes | FAIL tests: no test script | Clean | Clean | `Current W.` and `Add Fund` white on navy at 375px (15.46–18.12:1) |
| bs-s3 | yes | pass | Clean | Clean | `Current W.` and `Add Fund` white on navy at 375px (15.46–18.12:1) |

"Clean" means no page overflow, no sideways-scrolling container, no serif text and no underlined nav link. "Read CDS integration" counts only commands a run executed. All six read SKILL.md, the rebuild reference, CDS integration, scaffold and verification, and wrote a parity inventory to the rebuild's README (hc-s2 also wrote a separate parity file). The first count of this table marked hc-s1, hc-s3 and bs-s1 "no": it missed their single `cat` of a brace path (`references/{rebuild,cds-integration,scaffold}.md`), whose output includes CDS integration. Reading CDS integration and scaffold did not prevent either defect.

- **Health-check at 375px.** r5's result did not reproduce: none of the three columns fits the viewport.
  - The source has no overflow and no sideways scroller at 375px. It hides `.phc-add-column-zone` below its mobile breakpoint (`App.scss:254`) and sizes the column at `100vw`.
  - Each rebuild keeps that 42–48px zone beside a 327–343px column. Each also copied the source's scroll-to-end effect (`App.tsx:897`, `:483`, `health/App.tsx:661`), so the page loads with the container scrolled by the overflow, clipping the column's left edge.
  - Setting `scrollLeft` to 0 reveals the edge.
  - hc-s2 also has two unlabelled buttons extending past the right edge, to 398px at 375 and 1463px at 1440, without page overflow.
- **hc-s1's stylesheet.** The grader flags `.phc-card > div` (`workspace.css:288`). At `PortfolioManagement.tsx:146` and `:252` it matches raw JSX divs. It also matches the root of the CDS `ProgressBar` at `:282`, which renders an `HStack` div. That means the rule reaches into a CDS component, so the FAIL stands.
- **bs-s1 overflow.** Each panel is a `<Box as="section">` with no `flexDirection` (`App.tsx:109`). CDS `Box` computes to `display: flex` in a row, so each panel lays out its fund cards side by side. Neither neon-create nor its references mention that default.
- **bs-s2 tests.** It has no test script. Its `./scripts/check-source-parity.cjs` passes, comparing calculation and state against the source across 3 modes, 9 global strategies, editing, FIX/UNDO, save/load and apply. The source has no tests.
- **Starter edits.** Compared files: the starter's `src/layout/*`, `AppRoot` and `vite.config.ts`.
  - hc-s1 changed every starter layout file and `AppRoot`. The `Logo.tsx` diff is formatting only; the others were not diffed.
  - hc-s3 rewrote `SimpleLayout`, `BottomNav`, `SidebarNav` and `navItems`.
  - Per its report, bs-s2 switched `AppRoot` to deep CDS imports to get around a build error. The other two batch-sell samples did not report that error.
  - hc-s2, bs-s1 and bs-s3 left the compared files byte-identical.
- **Other observations.**
  - All six rebuild READMEs say the starter's light scheme is kept. Only hc-s3 says dark mode is unverified.
  - All three batch-sell samples report the retained `@vercel/analytics` in their README.
  - Every run reported that Chromium could not launch in its sandbox and substituted DOM tests.
- **Skill fixes, landed after this re-sample in [PR #24](https://github.com/finnonemo/neon/pull/24):**
  - The rebuild reference's parity inventory now records the source's responsive rules (elements hidden, resized or rearranged at a breakpoint), and Build says to carry each one over and recheck layout-dependent copied effects such as scroll-to-end.
  - CDS integration now says `Box` computes to `display: flex` in a row, so stacked content needs `flexDirection="column"` or `VStack`. A follow-up repeats it in the rebuild reference's Build step, where rebuild runs lay out their panels.

### Re-run after PR #24, 26 October 2026

Same request and fixtures, with three new samples per fixture (hc-s4–s6, bs-s4–s6). Codex 0.162.1, skills as of `189263c`: the re-sample's skills plus the PR #24 rules and the `Box` clause in the rebuild reference's Build step. The fixture copies match the re-sample's starting commits, with the same source `node_modules`. The fixtures ran concurrently in pairs (hc-sN with bs-sN), one pair after another. Unlike the re-sample, the evaluator deleted the regular files each pair wrote to `/tmp` before starting the next pair. `/tmp/phc-browsers`, a directory, was left. No run's commands name the other fixture's `/tmp` files.

Every run finished on its first attempt and left no `auth.json`. Every sample passed source unchanged, no source UI library, typecheck and build, and kept Vite 5. Health-check also passed mock data. All six printed the rebuild reference, CDS integration, scaffold and verification, and their output includes both new rules. The evaluator ran the probe on each landing screen in light mode, with `viewportWidth` 375 and 1440 in every result. Inventory items, interactions and dialogs were not checked, so no sample is a full pass.

| Sample | Grader | 375px | 1440px | Rule under test | Primary-styled buttons |
| --- | --- | --- | --- | --- | --- |
| hc-s4 | pass | Clean | Clean¹ | Add-column zone hidden below 500px (`workspace.css:472`, `:505`); scroll-to-end guarded (`portfolio/App.tsx:835`) | None on the landing screen |
| hc-s5 | FAIL stylesheet (12 selectors); FAIL tests: no test script | `.phc-nav-items` scrolls sideways (755/374) | Clean¹ | Zone hidden (`health.css:94–96`, `:1593`); guarded (`health/App.tsx:640`) | `Home` nav pill, white on navy (18.12:1) |
| hc-s6 | pass | Clean | Clean | Zone hidden (`health/app.css:169`, `:205`); guarded (`app/App.tsx:342`) | Icon-only `Home` nav button, white on navy (18.12:1) |
| bs-s4 | FAIL tests: no test script | Clean | Clean | Panels are raw `<section>`s; `Box` only wraps rows of buttons (`app/App.tsx:698–776`) | `Current W.`, `Add Fund`, `Set Current Port`, white on navy (15.46–18.12:1) |
| bs-s5 | FAIL tests: no test script | Clean² | Clean² | Stacked panel and fund `Box`es set `flexDirection="column"` (`app/App.tsx:719`, `:737`, `:758`, `:774`, `:790`, `:813`) | `Current W.`, white on navy (18.12:1) |
| bs-s6 | FAIL tests: no test script | Clean | Clean | Raw `<section>` panels; no `Box` in app code | `Current W.`, `Add Fund`, six `Model`, `Set Current Port`, white on navy (15.46–18.12:1) |

¹ The probe flags the starter sidebar's logo link (`Logo.tsx`, byte-identical to the starter) as an underlined nav link. It is a 32px image link with no text. Whether an underline is visible was not checked.
² See the gauge dots below.

- **Health-check at 375px.** The re-sample's overflow did not recur. All three hide the add-column zone below 500px, as the source does. Each lists that rule in its inventory: hc-s4 and hc-s5 in a separate parity file (lines 52 and 20), hc-s6 in its README (line 19). All three copied the scroll-to-end effect, but each added a `columns.length > 1` guard that the source lacks (`App.jsx:651`), so a single column loads at `scrollLeft` 0. Every run read the new rules, so this matches the fix. With three samples it does not show that the fix caused the change.
- **hc-s5's navigation.** Below 500px its own `.phc-nav-items` becomes a row with `overflow: auto` (`health.css:1593`). `Insights` and `Notifications` sit past the right edge (to 645px) and are reachable only by scrolling the nav. The re-sample found no sideways scroller in the source at 375px.
- **hc-s5's stylesheet.** Its `ui.tsx` reimplements the Carbon component API over CDS. `Typography` wraps a CDS `Text` in an app `<span>`, so descendant selectors such as `.phc-pvd-mf-header span` (`PortfolioVersionDetail.tsx:39`) match the CDS `Text` root as well as the wrapper. The FAIL stands. `Action` drops its `className`, so `.phc-pill-btn--labeled span` matches nothing. Its own `npm run verify` prints PASS.
- **Batch-sell width.** bs-s1's overflow did not recur: none of the three overflows at either width. Only bs-s5 used `Box` for stacked content, and it set `flexDirection="column"` each time. bs-s4 and bs-s6 built their panels from raw `<section>`s with app classes, so they did not exercise the rule.
- **bs-s5 gauge dots.** The probe reports its six 14px `batch-gauge-dot` buttons, which have no text, at 1:1. They take `var(--color-fg)` (`calculator.css:13`). The source dot is green when the fund is aligned and red otherwise (`App.tsx:1128`). bs-s5 keeps that signal on the gauge fill and drift label (`app/App.tsx:823`, `:826`), but not on the dot. bs-s6 keeps it on the dot (`app/App.tsx:828`).
- **Tests.** hc-s4 and hc-s6 have test scripts that pass. The grader fails the other four for having no test script. bs-s5's `check:parity` and bs-s6's `test:parity` pass, comparing calculation and state against the source. bs-s4 has neither.
- **Starter edits.** Same compared files as the re-sample. hc-s4 and hc-s6 changed only `MultiColumnLayout.tsx`, and the other four left them byte-identical.
- **Limits.**
  - Three samples per fixture, Codex only.
  - Landing screens only. Inventory items, interactions, dialogs and the 499/500px boundary were not checked.
  - Dark mode is unverified, because the starter fixes light.
  - The `/tmp` cleanup between pairs is a method change from the re-sample.
  - Every run read CDS integration, so the re-run cannot show whether the rebuild reference's `Box` clause matters on its own.
  - The runs predate the starter layout and CDS integration changes merged from PRs #20 and #22.

## Reference design evaluation

See [the reference design protocol](reference-design-protocol.md) for the Brand Intensity matrix. Third-party reference designs and generated pages stay under `.local/`.

October 2026, Codex, one sample per revision. The fixture holds `./DESIGN.md`, a synthetic dark style for an invented brand, Lumora: lime `#C6FF3D` actions, ultraviolet accent, Space Grotesk "installed from Google Fonts", 2px radius, fade-up motion and the line "See further.". Any of those brand strings in the output is a Brand Floor leak.

- **Landing page** ("using ./DESIGN.md as the reference design"). Before (main): did not read a reference procedure; `#c6ff3d` appears 18 times, plus `#7a5cff` and Space Grotesk, and the report says "the reference's dark styling". Fail. After: read the reference design procedure; no Lumora strings; kept the reference's timeline and fade-up motion (24px, 400ms, 80ms stagger); the report names what came from the reference and offers a more Finnomena-led or reference-led look. Pass on the Brand Floor and the dial offer.
- **Back office screen** with the same file "as a reference". Before and after: no Lumora strings and no dial offered. After also read the reference design procedure. Pass both; no measurable difference.

Limits: one sample each, Codex only, source text inspected rather than rendered screens (browser checks were blocked by the sandbox), the 2px radius did not visibly carry over so Blended geometry is only partly shown, follow-up dial moves and Reference-led were not run, and the reference is synthetic rather than a Refero style.

November 2026: [ADR 0004](../../docs/adr/0004-immersive-pages-keep-a-thin-brand-floor.md) thinned the Brand Floor to the logo, IBM Plex Sans Thai and at least one Finnomena color, with white actions allowed on immersive pages. Decision walkthroughs, 1 November 2026, Claude (general-purpose subagents), one sample each, against the uncommitted revision for #70. Fresh agents read the installed skills and reported files read, decisions and the lines behind them; nothing was built or rendered.

- **White CTA follow-up** on a dark campaign page: white fill, navy label, a 3:1 boundary only on light sections, change kept in the page's existing scoped mechanism, shared theme untouched. Pass. It noted that neon-create's "colors-only … follows neon-redesign" line pulls against staying on the CDS path.
- **Back office "make the primary button white"**: keeps the shared primary navy, asks one scope question, offers only a local exception with a dark label and boundary. Pass.
- **Review of a white-CTA immersive page** with no navy or yellow: no brand finding; indigo-on-charcoal contrast listed as unverified. Pass.
- **"This style" from one telemetry screenshot**, empty folder: three static mockups before any build, screenshot saved with a note, source logos, photos and typeface dropped. Pass. It found that saving the reference before scaffolding makes the installer refuse the folder; the rule now saves after scaffolding.
- **"ยังไม่ใช่ที่ต้องการ" after two rejected builds**: no fourth rebuild; three distinct static directions and rereads the saved note. Pass.

Limits: one sample per case, one model, decisions only; no app was built, so visual quality and the mockups themselves are unverified.

The gradient scenario added with the gradient recipes (November 2026) has not been run; only `gradient-recipes.test.mjs` checks the recipe table against the token export and its contrast claims.

## Readiness

October 2026, Codex, one sample per case, `$neon-create` from an empty destination, after compliance confirmed the readiness criteria in #32. Requests named the campaign, event and links, and gave no hint about readiness.

- **Fund campaign** (Thai; a named fund with 18.2% 1-year and 9.6% annualized 3-year returns, a 1.2% fee and a "ลงทุนเลย" link). Brand-ready. The page carries a labeled box "พื้นที่สำหรับคำเตือนความเสี่ยงที่ได้รับอนุมัติ" awaiting compliance wording, with no drafted disclaimer. It shows only the supplied figures, and the handoff notes they were not independently verified. Pass.
- **Recruiting form** (English; an internship sign-up with name, email, phone and university). The run asked which approved form service receives sign-ups. With no answer, it labeled the action "Preview sign-up", sent and stored nothing, and reported Brand-ready. Pass.
- **Event page** (Thai; no forms or investment content, real map and calendar links). On the first rule (`f7fc7fa`), the build passed and nothing was deployed. The report was Brand-ready because browser checks were unverified (sandboxed Chrome would not launch) and no share image was set. That applied the rule as written, which required the checklist to pass, and it failed the scenario's intent. After checklist items became pre-launch to-dos (`f13ac0b`), the same request reported Ship-ready and wrote a readiness list: passed items, plus each unverified item with its action (convert the share SVG to PNG at an absolute URL; open the page at 375, 768 and 1440px and check overflow, keyboard and console; click the map and calendar links). Pass. The final reply named the to-dos only by pointing to that list.

Limits: one sample each, Codex only, no rendered screens (browser launch was blocked in every run), and the recruiting run could not show behavior after an employee names an approved service.

## Motion safety

Fixture: an empty folder holding a `./DESIGN.md` for a fictional analytics brand whose motion "carries the whole page": hero headline words rise from `opacity: 0`, every section below the hero starts at `opacity: 0` until an IntersectionObserver adds a class, plus a marquee, a floating card and a scroll-drawn timeline. Request, verbatim:

> $neon-create Build a Thai event page in this folder for "Finnomena Design Day 2026", a free public design meetup on 12 December 2026 at Finnomena's office. Include the agenda, three speakers, a venue section with this map link https://maps.app.goo.gl/finnomena-office and an add-to-calendar link https://calendar.google.com/calendar/event?eid=design-day. There is no sign-up form. Use ./DESIGN.md as the reference design.

Pass requires all of:

- Under emulated `prefers-reduced-motion: reduce`, every section's text is visible at 375px and 1440px as soon as it is scrolled into view, without waiting for an animation or a reveal script. The evaluator reads every section without scrolling, which is stricter.
- With the IntersectionObserver stubbed to never fire, no text stays hidden: no hidden starting state waits on a script.
- The `<h1>` and its children are at full opacity 100ms after `DOMContentLoaded` with default motion.
- The Ship-ready checklist names the production preview, not the dev server, for the 375px and 1440px check.

November 2026, Codex 0.162.1, one sample per revision, run through `run-codex-case.mjs`. The evaluator built each result with Vite and measured it with a scratch Playwright script.

| Item | Before (main at `97ad7b4`) | After |
| --- | --- | --- |
| Read readiness, reference design, verification | Yes | Yes |
| Reduced motion, 375px and 1440px | Only the hidden "pause animations" button | Nothing hidden by motion; a header label is `display: none` at 375px by layout |
| Reveal script stubbed | Nothing hidden: sections hide only under a class the script adds | Nothing hidden: no observer |
| Heading at first paint | Each `<h1>` line at opacity 0, rising in | Full opacity, no entrance animation |
| 375px/1440px evidence | "development server returns HTTP 200"; recheck says "open the preview" | Pre-launch to-do: "Verify production build and preview at 375px, 800px and 1440px" |
| Readiness | Ship-ready, to-dos listed | Ship-ready, to-dos listed, plus a reduced-motion to-do |
| Verdict | Fail: heading, dev-server evidence | Pass |

Both runs built and typechecked, and neither could launch a browser, so each reported rendered checks unverified. After kept less of the reference's motion than Before: one date card floats under `no-preference`, with no hero rise, section reveals or marquee. The skill asks for safe motion, not less of it, so a second sample should show whether this is a pattern. Limits: one sample per revision, Codex only, the motion checks were measured by the evaluator rather than the runs, and both runs wrote working files to the real `/tmp`. The fixture and the evaluator's Playwright script stayed local, so the case is described here rather than rerunnable from the repository. After also wrote a new `./VERIFICATION.md` into the app beside its `./README.md`, which Before did not; this record does not attribute that to the change.

## Sample figures

Fixture: a folder holding only `.gitkeep`. The case runner `git init`s the app folder and the installer refuses a nonempty destination, so the request names a new subfolder. Request, verbatim:

> $neon-create Build a Finnomena Back Office fee-report screen in a new fee-report folder here: fees collected this month per fund and fee type, with totals and the change from last month. There is no backend yet, so use mock data.

Pass requires all of:

- Totals and KPIs are computed from the rows of one data module, with relations asserted in development.
- Numeric cells are right-aligned with tabular figures.
- Each metric declares its good direction, and change color follows it; an unchanged value is unsigned and neutral.
- A real zero prints as zero, not a dash.
- No placeholder names; the Handoff Summary lists the headline sample figures and names the data module.

November 2026, Codex, one sample per revision. Builds were rendered in headless Chromium at 1440×900; per-cell computed styles were read from the DOM.

- **Before (`97ad7b4`):** totals came from the rows of `report.ts`; the 40 numeric cells sampled computed `text-align: right` and `tabular-nums`, from CSS; a zero fee printed `0.00`; the handoff gave the three monthly totals. Change color was "green means up" (`n>=p ? 'fee-up' : 'fee-down'`), so an unchanged value would show a green `+0.0%`. No good direction was declared, and the arithmetic checks ran from a script in `/tmp`, not in the app. Funds were named "Finnomena Thai Equity" and similar. Fail on direction and zero change.
- **After (this revision):** `data.ts` declares `upIsGood: true` and says why (fees are Finnomena revenue); changes use `fgPositive`/`fgNegative` from it, and zero change is `fgMuted` and unsigned. `console.assert` checks run under `import.meta.env.DEV`. The 40 numeric cells sampled compute `text-align: right` and `tabular-nums`; changes use `Text tabularNumbers`. The footer total equals the 1,467,120.00 KPI, a real zero fee prints `0.00`, and funds are fictitious ("Nova Thai Equity"). The handoff lists six headline figures and names `src/features/fees/data.ts`. Pass.

Limits: one sample per revision, Codex only, so the difference may be sampling. Both chose fees as revenue, so a fall rendered `fgNegative` in both; the eval cannot show a run choosing the cost direction. The dev assertions were read, not run: rendered builds are production builds. The development assertions only check each row against its own parts, not the KPIs. Fonts rendered in headless Chromium, not on employee machines. The Campaign Page exclusion was not exercised.

## Campaign Page content

November 2026, Codex 0.162.1, one sample per revision, `$neon-create` through `run-codex-case.mjs` into `./open-house` beside a `.gitkeep`-only workspace. Before is main at `97ad7b4`. After adds [campaign content](../../skills/neon-create/references/campaign-content.md) (`60fa070`). The two cases ran at the same time. Request, verbatim:

> $neon-create Build a Finnomena recruiting event page in ./open-house. The event is "Finnomena Open House: Build with Us", for engineers, designers and data people who might join our team. It's on Saturday 28 November 2026, 13:00–17:00, at Finnomena HQ, Column Tower 22nd floor, Ratchadaphisek Road, Bangkok. Agenda: team talks, an office tour, portfolio reviews and 1:1 chats with hiring managers. People register on our careers site: https://www.finnomena.com/careers/open-house. Headline in Thai. Include a section with what our employees say about working here and a row of partner company logos.

Neither run checked the page in a browser: the before run reported no browser automation tool, and the after run's Chromium launch was blocked by the sandbox. The evaluator built each page and measured it in headless Chromium, light mode, at 375×812 and 1440×900. It counted each `h1`–`h3` line from its text-node rects, merging rects that overlap vertically, with IBM Plex Sans Thai confirmed as the computed font, and listed the text inside the first viewport. Element screenshots of the H1 and H2s matched the counts. A first count from distinct rect tops gave four lines for a two-line H2 with an inline `✳`, so the reference's counting example was changed to merge overlapping rects after the after run.

| Item | Before | After |
| --- | --- | --- |
| Skill files read | SKILL.md, INSTRUCTION.md, readiness, scaffold, CDS integration, verification | Same plus campaign content |
| Claim list in the report | None | Generated README table of seven claims, each with its supplied proof and section, including the two requested sections that had none; the final reply linked to it |
| Date and place on the first screen at 375 | Fail: time and "BANGKOK, TH" at 10px; the date is below the fold | Partial: on the first screen, not in large type; "28 พฤศจิกายน 2026" and "Finnomena HQ" at 15px, "Column Tower ชั้น 22" at 10px, against a 44px H1 |
| Headlines at most two rendered lines | Fail: H1 three lines at both widths; one H2 three lines at 375 | Pass: every heading at most two lines at both widths |
| No invented proof | Pass: an "Employee stories are coming here" note and four "Partner logo n" slots | Pass: a quote prefixed "ตัวอย่าง:", "ชื่อพนักงาน (ตัวอย่าง)" and four `[Partner logo n]` slots |
| Sample content as pre-launch to-dos | Pass: quotes and logos listed as failed items | Pass: listed with what replaces each |
| Readiness | Ship-ready, no deployment | Same |

Both pages had no horizontal overflow or console errors at either width. Generated apps, `grade.txt` and screenshots stay under `.local/evals/content-*`.

Limits: one sample each, Codex only, one viewport height per width and light mode only. Only `h1`–`h3` were counted, so display text outside headings, such as the before run's 122px "BUILD WITH US" and the after run's "HELLO, FUTURE TEAM.", was not checked. The before run already avoided invented proof, so this sample shows no difference on that item. The after run put date and place on the first screen but at 15px rather than in large type. No Reference Design was supplied, so mapping claims onto a reference's section order and a later Brand Intensity move were not exercised. Both runs added a `design-day-starter` entry to `/tmp`, and the after run also added `check-fee.cjs` and `neon-before.css`. These may belong to other sessions running at the same time, so they were left in place.

## First screen

November 2026, Codex, rendered by the evaluator in headless Chromium at 1440×900; one sample per revision, two of the latest. The fixture and fee-report request are the ones in [Sample figures](#sample-figures). The tracker request is the [mock labeling](#mock-labeling) one, naming a new `request-tracker` folder for the same reason.

| Run | Requested block on load | Most frequent action | Main question stated |
| --- | --- | --- | --- |
| Tracker, before (`97ad7b4`) | List heading, 3 complete rows, detail beside | "New request" under the page title | No |
| Tracker, after (first wording) | List heading, 4 complete rows, detail beside | "New request" in the title row | No |
| Fee report, before (`97ad7b4`) | "Fund breakdown" heading at 704px; no complete fund row, under a KPI strip and a fee-type band | "Export CSV" in the title row | No |
| Fee report, after (first wording, "first rows") | Fund table heading at 630px; 1 complete row, under the same two bands | "Export CSV" in the title row | No |
| Fee report, after (second wording, "three complete rows") | Fund table heading at 627px; 1 complete row, under the same two bands | "Export CSV" in the title row | Yes, totals and change answer it |
| Fee report, after (this revision, "no band when the list carries the totals"), sample 1 | Table heading at 456px; all 6 fund rows complete (last ends at 875px); no summary band, fee types as columns; total footer row cut at the fold (ends 934px) | "Export CSV" in the title row | Yes |
| Fee report, after (this revision), sample 2 | Table heading at 417px; all 6 fund rows complete (last ends at 846px); no summary band, fee types as columns; total footer row ends at 908px, its text visible | "Export CSV" in the table's title row | Yes |

The tracker request does not tell the revisions apart: both pass. On the fee report, the first two wordings did not change the layout: both runs read the rule, could not render (the Chromium launch was blocked in the sandbox) and built a separate fee-type band, reading "per fund and fee type" as naming it. This revision says that when the list already carries the totals and the named breakdown as columns, no summary band goes above it. Both samples then dropped the KPI strip and the fee-type band, put fee types in columns and totals in a footer row, and passed. Both still could not render; each stated the main question and reported the rendered check as unverified. In sample 1 the grand-total footer row is cut at the fold, which the rule allows: it asks for three complete rows.

Review, same fixture: the baseline fee build plus its 1440×900 screenshot, `$neon-review Review our Finnomena fee report screen for usability. fee-report-1440x900.png is how it looks on load at 1440x900. Do not edit anything.` Before and after both reported "fund details below the fold" as Medium, citing the 1440×900 screenshot, and changed no files. The revised run ranked it first. That is no measurable difference.

Limits: Codex only, two samples of this revision and one of each earlier one, and no run could open a browser. The rule's example breakdown ("per fee type") matches this request, so the pass may partly reflect that wording; a request with a different breakdown was not run. The review runs used the second wording, not this one. The `composition: 'preserve'` caveat was not exercised. A summary the request asks for is exempt and kept, compact; no request asked for one, so the exemption was not exercised.

## Functional patterns

Rules in [functional patterns](../../skills/neon-audit/references/functional-patterns.md), drawn from local research into two public product design systems (kept in `.local/research/references/`). Static guards: `functional-patterns.test.mjs`.

| Request/context | Pass requires |
| --- | --- |
| Build a Finnomena fund-switch form for mobile, in the starter | At 375px the submit action sits in a bottom dock above the BottomNav (or the nav is hidden for the flow); the dock covers no field; buttons stacked, primary nearest the bottom; one primary action on the screen |
| Build a Finnomena notification-settings screen | Settings render as list rows with inset dividers and no divider after the last row, not one card per setting; no shadows on on-page regions |
| Build a Finnomena request tracker (same as [First screen](#first-screen)) | Row approve/reject actions are secondary or tertiary; the screen has one primary action |
| `$neon-redesign` colors-only on an existing card-per-row settings screen | Cards, order and geometry unchanged; any pattern miss is reported, not fixed |
| `$neon-redesign` `composition: 'adapt'` on a CSS-only (non-CDS) list screen | Applies the principles in CSS; installs no CDS |

November 2026, Codex 0.162.1, one sample per revision, run concurrently through `run-codex-case.mjs` on a folder holding only `.gitkeep`. Before is `6c0a1f6`; after is this revision. Request, verbatim:

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

## Look and fix

The shared checklist's [Look and fix](../../skills/neon-redesign/references/verification.md#look-and-fix) section asks a run to screenshot its main task at 375px and 1440px, critique the screenshots in neon-review's finding shape, fix the top three problems, stop after three rounds, and report each round on its own line. Without visible screenshots it reports the loop as not run. neon-create and neon-redesign link it from step 5 and Done.

Fixture: the starter assembled at `6c0a1f6`, made into an existing app with Home and My requests hash routes (`src/app/useRoute.ts`), `src/services/requests.ts`, and a mock `src/services/approvals.ts` whose contract the comment says to keep. Vite is pinned to port 5301 and the dev server was started before each run. Each sample ran on a fresh copy of the fixture, in its own git repository, outside the Neon checkout so no `AGENTS.md` sits above it. Request, verbatim:

> /neon:neon-create Add a Finnomena approvals screen to this app for managers: a list of pending expense approvals they can open to see the details, then approve, or reject with a reason. Use the existing approval service in src/services/approvals.ts and keep the app's shell, routes and theme. The dev server is already running at http://localhost:5301.

Pass requires a written critique round in the report that names its screenshot widths, with fixes applied before Done, and no numeric score.

November 2026, Claude Code 2.1.316, `claude -p --model claude-opus-5-5 --setting-sources project,local --plugin-dir <package> --mcp-config <browser> --strict-mcp-config --permission-mode dontAsk --allowedTools <list>`. The browser is the evaluator's MCP tool from [Browser probe in verification](#browser-probe-in-verification), whose screenshots reach the agent as images. `--setting-sources project,local` leaves out the evaluator's user hooks, which block `cd`. Baseline is the `6c0a1f6` package. Revised is `f1d0bc8` for the first sample, then `c1478c8`, which asks for the critique in messages and the widths on each report line. Runs used one of two allowlists:

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

Every run, baseline included, looked at its own screenshots and edited after a 1440px screenshot (see the table). Only the revised runs wrote rounds into the report. With one usable sample per arm, whether the skill change causes that is unverified. Neither revised run wrote findings in neon-review's shape (severity, location, evidence, fix, recheck) in its visible messages. Each wrote short notes such as "Fixing: keep the amount column at full width", so that part of the section is not yet followed. Revised-2's round lines name widths, but not in the fixed `Look and fix, round N (…)` shape, and round 1 used only 1440px screenshots. No report gave a numeric score. Revised-1 called the Back Office screen Ship-ready, against [Readiness](#readiness). Revised-2 and Baseline-2 said Brand-ready. Run logs, screenshots, grades and diffs are in `.local/evals/53-{baseline-1,baseline-2,revised-1,revised-2}`. The fixture, run script and grader are in `.local/evals/53-tools`.

Limits: one usable baseline and one revised sample, Claude Code only, on the evaluator's browser tool. The orchestrator's rule voids any sample with a denied command, and only Baseline-2 had none. Revised-2's two denials did not stop it using the shell, but a rerun with full Bash was refused by the evaluator session's own permission classifier, so no clean revised sample existed until the [paired rerun](#paired-rerun-1-november-2026). The baseline and revised samples that count ran with different allowlists. Not exercised: colors-only scope, `composition: 'preserve'` on existing UI, dark mode (the fixture has none), and the no-screenshot fallback, including Codex. The "Functional screen habits" link was a placeholder in these samples; #54 added the table, see [Functional screen habits](#functional-screen-habits).

### Paired rerun, 1 November 2026

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

In Baseline-2, one browser `evaluate` whose promise never resolved ran from 02:43 to 03:13 UTC, when Claude Code's 1800-second MCP timeout aborted it: two-thirds of the 45-minute budget. The agent then split the probe into steps, but its next `navigate` got no reply until the cap closed the browser at 03:25. The harness's part in both stalls is unverified, so the sample is unverified rather than a fail. Both revised runs wrote round lines in the section's `Look and fix, round N (…)` shape. Revised-2's round 1 claim, amounts cut to "฿12,60…" in the list at 1440px, matches its first screenshot. Its round 3 fixes (focus after a decision, screen-reader announcements, an empty detail page after refresh) are behavior found by testing, not problems visible in a 375px screenshot. Neither revised run wrote findings in neon-review's shape in its messages. Baseline-1 and Revised-2 called the Back Office screen Ship-ready, against [Readiness](#readiness). No report gave a numeric score.

Limits: one usable baseline and two revised samples, Claude Code only, on the evaluator's browser tool. Every sample had one denied command, and none stopped the build or the look. With one usable baseline, whether the skill change causes the round lines is still unverified. Revised-1 said the probe's 1440px pass timed out twice and checked that width by hand; the cause is unverified. Run logs, screenshots, grades and diffs are in `.local/evals/53-rerun-{baseline-1,baseline-2,revised-1,revised-2}` in the orchestrator worktree. The prep, launch and collect scripts, the allowlist and the note are in `.local/evals/53-rerun-tools`.

## Browser probe runner

[probe-page.mjs](../../scripts/probe-page.mjs) runs the shipped probe in headless Chrome over a CDP pipe, with no npm dependencies, when the agent has no browser tool. It adds three Neon rules: IBM Plex Sans Thai faces loaded and drawing the Thai and Latin text, the Finnomena logo present, and the source brand absent from the title, meta content and alt text. The probe fixture's Neon cases, plus `probe-fixture-no-plex.html` and `probe-fixture-thai-404.html`, run in `run-probe.mjs --fixture`. Runner behavior (missing Chrome, launch failure, timeout, a page that does not load, screenshots kept out of the app) is in `probe-page.test.mjs`.

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

## Source lint

Item 5 of the shared checklist runs the shipped [source-lint.mjs](../../scripts/source-lint.mjs) on the app and asks for a `Source lint:` report line that fixes or justifies each warning. The lint reads only the files changed against HEAD plus untracked files and always exits 0. Its rules live in `scripts/lib/source-rules.mjs`, which `stylesheet-scope.mjs` imports. `source-lint.test.mjs` covers the rules and asserts the grader keeps no copy of them.

Fixture (seeded, kept at `.local/evals/57-fixture`): a 60-line Vite/React "Sell orders" screen whose CSS is only `@import "tailwindcss";`, styled with stock utilities, committed as the first commit of its own git repository. It has a disabled button with `text-slate-300` text, which the Tailwind mapping rules say stays stock ("never darken it"), so a rule-following restyle always leaves at least one stock palette utility. It also has pale `green-200`/`amber-200` badge borders. The dev server is pinned to port 5701. Request, verbatim, as in [Tailwind colors-only regression](#tailwind-colors-only-regression):

> $neon-redesign Colors only: switch this app's colors to Finnomena colors. Keep the layout, components, spacing and behaviour exactly as they are.

Pass requires the run to execute the lint, and the report to name each stock utility the lint warns about on the result, as fixed or kept with a reason.

November 2026, Claude Code 2.1.316, `claude-opus-5-5`, one sample on the baseline package (main at `6c0a1f6`) and two on this change (package built from `808dc7b`, before the merge with the browser probe runner and before the content rules stopped reading code comments; that change does not touch the stock palette rule this case exercises). Each run used a pristine fixture copy, the evaluator's MCP browser tool, `--add-dir` for the package and `/private/tmp/claude-501`, and `--permission-mode dontAsk`. Allowed: `Read Edit Write Glob Grep Skill Bash` and the browser tools. Denied: `rm`, `rmdir`, `mv`, `git push/commit/reset/checkout/clean/stash`, `sudo`, `curl`, `wget`, `WebFetch` and `WebSearch`. The grader then ran this change's lint on each result.

| Item | Baseline (`6c0a1f6`) | This change, sample 1 | This change, sample 2 |
| --- | --- | --- | --- |
| Read verification.md | Yes | Yes | Yes, through `cat` |
| Ran the lint | No (not shipped) | Yes, after `npm run build` | Yes, after `npm run build` |
| Stock utilities left (grader's lint) | `border-green-200`, `text-green-700`, `border-amber-200`, `text-amber-700`, `text-slate-300` | Same five | Same five |
| Report | Keeps "badge text and borders" green and amber (status text measures 3.61:1 and 3.00:1, no pale border token), and disabled text "its original pale grey"; no lint line | "**Source lint:** five warnings, one for each Tailwind color kept above. All are intentional."; each kept utility is named above it with its reason | "Source lint flagged 5 old colors left in place. These are the badge text and borders and the disabled text listed above, all kept on purpose." |
| Build, browser | Pass; probe at 1440px and overflow at 375px | Pass; probe at 375px and 1440px | Pass; probe at 375px and 1440px |
| Verdict | Fail: no lint run; the leftovers are justified from the agent's own review | Pass | Fail: ran the lint and answered every warning, but in prose, with no `Source lint:` line |

Every leftover in all three runs was a deliberate exception under the mapping rules, and the baseline justified the same five without a lint. So these samples (one pass, one fail on the report line) show the lint running and its warnings being answered in the report; they do not show it catching a utility the agent overlooked. Each run had one denied Bash call: a `VAR=…; … $VAR/…` compound (baseline, sample 2) or a `cp` into the agent's own scratchpad (sample 1). Each run kept using the shell, built, and used the browser afterwards. Three earlier samples are void and kept for reference. Two ran on the `claude -p` default model (Haiku) under a prefix allowlist, and one on `claude-opus-5-5` under that allowlist. In each, a denied compound command led the agent to report Bash as blocked. Limits: three samples, Claude Code only, no Codex run, light mode only, one seeded fixture with no overlooked utility, and a run directory inside the neon worktree, whose repository paths the agents could see. Evidence is in `.local/evals/57-before-1`, `57-after-1`, `57-after-2` and `57-void-*` (`run.jsonl`, `grade.txt`, the result app and its git history).

## Functional screen habits

neon-review's [Functional screen habits](../../skills/neon-review/references/review-checks.md#functional-screen-habits) table lists eight generated-dashboard habits, each with a CDS component, prop or composition alternative and no CSS override. It says Neon navy structure and indigo focus, selection and links are contract roles, not habits, and that review-only edits nothing. Look and fix in verification.md links it from the critique. [Tables on narrow screens](../../skills/neon-create/references/new-ui-workflow.md#tables-on-narrow-screens) in new-ui-workflow.md turns a table in a container narrower than about 640px into two-line rows: identity and key figure, then every other field with its label. `functional-habits.test.mjs` covers the section order, the rows, the absence of CSS and navy/indigo rows, the link and the narrow-screen rules.

November 2026, Claude Code 2.1.316, `claude -p --model claude-opus-5-5 --setting-sources project,local --plugin-dir <package> --add-dir <package> --mcp-config <browser> --strict-mcp-config --permission-mode dontAsk`, with the evaluator's browser tool from [Browser probe in verification](#browser-probe-in-verification). Baseline is the `8a98f91` package; revised is `eef5202`. Each sample ran on a fresh fixture copy in its own git repository outside the Neon checkout. Allowlist: `Read Edit Write Glob Grep Skill`, the five `mcp__browser__*` tools, and `Bash(…:*)` for `ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx`, `npm run`, `git status/log/diff/ls-files/rev-parse/show/branch`, plus `sips` and `file` from Revised-2 on and `python3` from Baseline-2 on (Baseline-2, Revised-3 and the build baseline). Bash was never unrestricted.

### Review of a habit-laden screenshot

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

### Finnomena fund-fee table at 375px

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

## Output quality (blind)

The other sections check that a skill follows its contract. This one asks whether a skill change made the output look and work better, as a blind reviewer judgment. It compares two packages, such as main and a revision, on the same two requests, with a judge who sees only screenshots under neutral names. It records preferences and named problems, never a numeric score or rating scale, and the result never feeds readiness, which follows work type ([ADR 0002](../../docs/adr/0002-readiness-by-work-type.md)).

### Requests

Each sample starts in its own empty folder, a fresh git repository outside the Neon checkout, so no `AGENTS.md` or other package sits above it. The only per-run text is the trailing port sentence. Verbatim:

> /neon:neon-create Build a Finnomena event page in ./event. The event is "Finnomena Data Night: เบื้องหลังเครื่องมือข้อมูล", an evening meetup for engineers, analysts and designers about how our team builds data tools. It's on Thursday 10 December 2026, 18:30–21:00, at Finnomena HQ, Column Tower 22nd floor, Ratchadaphisek Road, Bangkok. Agenda: three short talks by our data team, a live demo of our internal dashboards, then networking with food and drinks. Registration is on https://example.com/data-night. Headline in Thai. Use port &lt;port&gt; for any dev or preview server.

> /neon:neon-create Build a Finnomena Back Office approvals screen in ./approvals with mock data. Operations staff review pending customer requests (fund switches, redemptions over the daily limit and KYC updates), open one to see its details, then approve it, or reject it with a reason. Use port &lt;port&gt; for any dev or preview server.

The event page is a Finnomena-led Campaign Page: no Reference Design is attached, so the dial does not apply and the page is Finnomena's own. All of its content is supplied and it has no form or Investment Content, so content honesty and readiness do not confound the comparison.

### Samples and screenshots

Run three samples of each request per package, twelve runs in a round, on the agent's browser tool where it has one and the same permissions for every run. Name each run's folder neutrally, such as `56-run-07`, with the package mapping kept elsewhere, since the agent sees its own path. Use the [run harness](#run-harness) note and allowlist for every run, since agents otherwise read one denied command as the whole shell being blocked. A denial voids a sample only when it stopped the run building its output or looking at it; record every denied command either way. Cap each run's wall-clock time. A run killed at the cap keeps its output for judging and is recorded as killed, without a report.

The evaluator, not the agent, builds each output, serves its production build and screenshots it in light mode in its loaded state, with nothing clicked, at 375×812 and 1440×900: the first screen at each size, then the full page after scrolling through it so scroll-triggered reveals run. Every output gets the same procedure, so an approvals screen is judged as it first opens. Record any output that does not build, and judge what renders.

### Blinding

Pair baseline sample *n* with revised sample *n* for each request, giving six pairs. For each pair, randomly assign one output to side A and the other to side B, then shuffle the pair order. Copy the screenshots into a judge folder as `pair-<n>/<A|B>-<width>-<first|full>.png`, with the same modification time, and write the key (pair, side, package, sample) to a folder the judge never reads. Before judging, check that no screenshot names its package, revision or run.

### Judge

A fresh `claude -p` process with no transcript context, whose working directory is the judge folder and whose only tools are `Read` and `Glob`. The folder also holds a rubric file with the text of:

- the [Look and fix](../../skills/neon-redesign/references/verification.md#look-and-fix) critique questions;
- the [functional screen habits](../../skills/neon-review/references/review-checks.md#functional-screen-habits) table, applied to the approvals pairs only, since the event page is immersive;
- the [color roles](../../skills/INSTRUCTION.md#color-roles) and [one question, first screen](../../skills/neon-create/references/new-ui-workflow.md#one-question-first-screen) passages those questions link to.

For each pair the judge states a preference for A, B or neither, the reason in a sentence or two, and named problems for each side, each with its width and screenshot. It gives no number, score or rating. Save its answer before unblinding.

### Recording

Unblind with the key and record per pair: the preferred package or none, the judge's reason, and the named problems per output. Tally preferences per request as counts of pairs ("revised preferred in two of three pairs"), not percentages. Label the result as one reviewer's judgment. Under Limits, record the agent and version, the judge's model, samples, widths, color modes, states, permissions, ports, and every void, killed or unbuilt run.

Generated apps, run logs, screenshots, the key and the judge's answer stay under `.local/evals/`; only this protocol and its recorded results are tracked.

### November 2026 round

Baseline is the main package at `6c0a1f6`. Revised is the integration tip at `1b7e7c6`, which adds Look and fix (#53), the functional screen habits table (#54), the probe runner (#58) and the source lint (#57). Claude Code 2.1.316, `claude -p --model claude-opus-5-5 --setting-sources project,local --plugin-dir <package> --add-dir <package> --mcp-config <browser> --strict-mcp-config --permission-mode dontAsk --allowedTools <list> --append-system-prompt <note>`, with the evaluator's browser tool from [Browser probe in verification](#browser-probe-in-verification). At most three runs went at once on ports 5601–5603, under a 45-minute cap. The judge was `claude -p --model claude-opus-5-5 --setting-sources local --tools Read,Glob --strict-mcp-config --permission-mode dontAsk` in the judge folder. It made one Glob and 55 Reads, all inside that folder, with no denials.

| Pair | Request, sample | Preferred | Judge's reason, shortened |
| --- | --- | --- | --- |
| 1 | Event, 1 | Revised | Date, venue and one register action in one hero column, and a numbered agenda; the baseline repeats date and venue, misaligns blocks and breaks a Thai word |
| 2 | Event, 3 | Revised | A strong headline and a date, time and venue row at both widths; the baseline shrinks the headline at 375, uses light section headings and breaks Thai words |
| 6 | Event, 2 | Revised | Thai wraps cleanly and sections follow one structure; the baseline breaks Thai words and mixes heading weights |
| 3 | Approvals, 1 | Baseline | Opens with a request selected, so details and Approve/Reject are on the first screen; the revised output leaves the right half as an empty "select a request" pane |
| 5 | Approvals, 2 | Revised | Opens with a request selected, with the review reason and actions on the first screen; the baseline shows an empty detail pane |
| 4 | Approvals, 3 | Revised | Both leave the detail pane empty; the revised list right-aligns amounts and due times and names the overdue item in words |

Pair numbers are the judge's, from the shuffled order; rows are grouped by request. Revised was preferred in three of three event pairs and two of three approvals pairs. In the one approvals pair the baseline won, the revised run was killed at the cap with no report. Each output had problems the judge named in both arms:

- Thai words broken across lines, such as `เครื่อง / ดื่ม`, in four of the six event pages: three baseline (two at 1440px, two at 375px; one at both) and one revised (375px).
- On load at 1440px, an empty detail pane beside the list in four approvals outputs, two from each arm.
- At 375px, five of the six approvals outputs, three baseline and two revised, put a "View details" button above the page heading; the judge noted no logo or page context in three of them.
- At 1440px, figures left-aligned in proportional digits, named as a functional screen habit, in two baseline outputs and one revised.
- At 1440px, light-weight section headings or a pale closing register button in two baseline and one revised event page.

| Run | Request, arm and sample | Denied commands | Agent's own browser screenshots | Report lines naming Look and fix | Readiness reported |
| --- | --- | --- | --- | --- | --- |
| `56-run-01` | Event, baseline 1 | 0 | 5 | 0 | Ship-ready |
| `56-run-05` | Event, baseline 2 | 0 | 4 | 0 | Ship-ready |
| `56-run-09` | Event, baseline 3 | 1: a `cp` from the package | 7 | 0 | Ship-ready |
| `56-run-04` | Event, revised 1 | 1: a compound `cd …; grep … \| head` | 7 | 0 | Ship-ready |
| `56-run-08` | Event, revised 2 | 0 | 9 | 1 | Ship-ready |
| `56-run-12` | Event, revised 3 | 1: an `ls` above the workspace | 7 | 3 | Ship-ready |
| `56-run-03` | Approvals, baseline 1 | 2: a `for` loop, a `sed -i` | 9 | 0 | Brand-ready |
| `56-run-07` | Approvals, baseline 2 | 1: a compound `cd … && grep -v` | 11 | 0 | Brand-ready |
| `56-run-11` | Approvals, baseline 3 | 1: a `head` of a package file | 6 | 0 | Brand-ready |
| `56-run-02` | Approvals, revised 1 | 1: a `for` loop | 2 | None: killed at the cap during a browser `evaluate` that never returned | None |
| `56-run-06` | Approvals, revised 2 | 1: a variable assignment | 19 | 3 | Brand-ready |
| `56-run-10` | Approvals, revised 3 | 1: a compound `cd … && ls` | 10 | 1 | Brand-ready |

Every run built its app and screenshotted it in the browser, and every output built for the evaluator with no sideways scroll at either width. No denial stopped a run building or looking, so none is void under this section's rule.

Limits: one round of three samples per request and package, one judge, and Claude Code only, with the judge on the same model as the agents. Six pairs carry no statistical weight; read the result as one reviewer's judgment. Light mode only, and the loaded state only. Nothing was clicked, so approvals detail views, the reject flow, empty and error states, and the 375px detail route were not judged. Designs that open with a request selected were favored. The approvals screens scroll inside their panels, so their full-page shots equal their first screens. The rubric is the revised package's own checklist, which the baseline runs never saw, so the judgment partly measures following instructions only one arm received. The revised package also carries #57 and #58, so a preference cannot be credited to Look and fix or the habits table alone. The evaluator checked only one of the judge's claims, the empty pane in pair 3.

Every run got this harness note, verbatim: "Shell permissions in this session: Bash is allowed for commands that start with one of: ls pwd cd cat head tail wc grep find echo test sed rg sort which curl lsof kill sleep mkdir cp node npm npx sips file python3, npm run, git status, git log, git diff, git ls-files, git rev-parse, git show, git branch. A denied command blocks only that command; the shell stays available for allowed commands. Variable assignments, loops and $(...) substitutions are always denied, so run each command on its own, with literal paths." Earlier sections ran without it, so their runs are not comparable on this point. Allowlist: `Read Edit Write Glob Grep Skill`, the five `mcp__browser__*` tools, and `Bash(…:*)` for those prefixes. Bash was never unrestricted. The orchestrator's rule voids any sample with a denial. This round voids a sample only when a denial stopped it building or looking, since no prefix allowlist covers assignments and loops; ten of the twelve runs had one or two denials.

A first round of seven runs had no harness note and is void (`56-void-01`…`07`). Each opened with a compound `ls …; B=<package>; ls $B`, was denied, and then treated the whole shell as blocked. Three baseline runs finished with source only, saying the shell was blocked. Three more, from both arms, were stopped mid-run with no install, build or screenshot. Only `56-void-01`, a revised event run, recovered, and its folder name revealed its arm. When a run left its dev server up after reporting, the server was killed so `claude -p` could exit, and some runs then wrote a one-line follow-up saying the server had stopped.

Evidence is in `.local/evals/`: run logs, prompts, harness notes, app sources without dependencies or builds, and the evaluator's screenshots, in `56-run-01`…`12` and `56-void-01`…`07`; the judge folder and its answer in `56-judge`; the key in `56-key`; and scripts, the rubric, the run map and the summary in `56-tools`.

## Flow refactor evaluation

See [the paired evaluation protocol](flow-refactor-protocol.md) for exact prompts, fixture boundaries, measurements and acceptance. Evaluation apps and raw screenshots remain local; only a verified comparison report should claim outcomes.

## Review-fix scenarios — September 2026

Run these as instruction walkthroughs or real host tasks, and record which method was used. Expected outcomes below are acceptance criteria, not completed test results.

| Request/context | Expected decisions |
| --- | --- |
| Monorepo contains two plausible React apps; `Assess Finnomena adoption` names neither | Inspect workspace candidates, ask which app; no theme installation or arbitrary target choice |
| Theme files exist but are not imported; `Assess whether Finnomena is already wired` | Trace entry/provider imports; report inactive files rather than claiming successful integration |
| `Review this screenshot; do not edit` | Visible findings only; keyboard behavior, other viewports and exact measured contrast remain unverified |
| `Review accessibility` with source only and no browser access | Report source-supported findings and runtime limitations; no invented interaction pass or dependency installation |
| `Adopt CDS in this React app` without global or icon styles | Inspect existing imports, add missing imports once at permitted entrypoint; build and inspect a real component/icon |
| `Change only this Vue header's colors in light and dark mode` | Use scoped canonical mode declarations; preserve geometry, fonts, services and non-header consumers; no CDS |
