# Skill behavior scenarios

Run each request with the named context, first against the baseline and then the revised skill. Record the revision, prompt, supplied files, agent decisions, changed files and actual checks. Use an isolated app for implementation runs. Do not supply the expected answer to a fresh evaluating agent.

| Request/context | Observe |
| --- | --- |
| Add Finnomena approvals to an existing themed React/CDS app; retain providers/routes/services | Reuses installation and shell; builds actual list/detail/actions; navy foundation, indigo selection, labeled statuses |
| Build a colorful Finnomena product landing page | Immersive composition permits prominent brand color/illustration; does not force navy/white dominance; actions remain accessible |
| Create a Finnomena request tracker with mock data | Scaffolds in an empty destination and builds the feature; no demo/mock banner or state switcher in the UI; the report names what is mocked; relevant states exist |
| Build a Finnomena request tracker demo with mock data, labeled as a demo | Demo/mock labeling appears in the UI |
| Change only a Vue header to Finnomena colors | No React/CDS installation, font/layout changes or global theme side effects |
| Review this Finnomena screenshot; do not edit | Visible findings only; keyboard, other viewports and measured contrast remain unverified |
| Make the buttons clearer after Finnomena was established | Retains brand intent without repeated onboarding |
| Build a CDS settings screen with no Finnomena context | Does not infer Finnomena branding from CDS alone |
| Build a Finnomena event landing page from an attached Refero reference design | Starts at Blended without asking; keeps reference geometry; Finnomena palette, IBM Plex Sans Thai and logo; no source-brand name, copy or imagery; offers the dial |
| Build a Finnomena landing page from a reference design whose hero uses a multi-hue gradient | Keeps the gradient's placement and direction; its stops become a gradient recipe from `theme/tokens/colors.json`; no reference hue survives; hero text is readable at every stop beneath it |
| Follow-up: "ให้ดู finnomena มากขึ้น" | Moves exactly one level toward Finnomena-led; content, flow and composition unchanged |
| Follow-up: "use the reference's own colors and font" at Reference-led | Stays at Reference-led and explains the Brand Floor; no source font or accent color |
| Attach a reference design to a back office screen request | Functional contract; takes at most section structure; does not offer the dial |
| Campaign page promoting a fund with return figures | Brand-ready; labeled disclaimer placeholder; no drafted regulatory wording or invented figures |
| Recruiting page with a sign-up form and no named form service | Asks for the approved service; without one, no invented endpoint; Brand-ready |
| Event page with no forms or investment content | Ship-ready even with failed or unverified checklist items, which are listed as the employee's pre-launch to-dos; static build; does not deploy. See [Readiness](records/readiness.md) |
| Blended event page from a motion-heavy reference design | Under reduced motion every section is visible, no content waits on a reveal script, and the heading is readable at first paint; Ship-ready checklist evidence names the production preview for 375px and 1440px. See [Motion safety](records/motion-safety.md) |
| Build a Finnomena recruiting event page (date, place and link supplied; employee quotes and partner logos asked for but not supplied) | The report lists the claims; date and place appear on the first screen at 375px; no headline wraps past two rendered lines at 375 or 1440; no invented quotes, logos, counts or returns, and sample content is a pre-launch to-do. See [Campaign Page content](records/campaign-page-content.md) |
| Colors-only restyle of a Tailwind v4 app that uses stock utilities only | See [Tailwind colors-only regression](records/tailwind-colors-only-regression.md) |
| Restyle a v0 shadcn app to Finnomena, with and without a browser tool | The report cites the shipped browser probe's results at 375px and 1440px, or says the probe was not run and marks those checks unverified. See [Browser probe in verification](records/browser-probe-in-verification.md) |
| Restyle a v0/Lovable React + Tailwind v4 + shadcn project to Finnomena | Detects shadcn on v4; edits `:root`/`.dark` by role and pair; leaves `@theme inline`; installs no CDS. See [shadcn on Tailwind v4 restyle](records/shadcn-on-tailwind-v4-restyle.md) |
| Rebuild an existing React prototype on CDS; colors-only and feature requests on the same apps | See [CDS rebuild](records/cds-rebuild.md) |
| Build a Back Office fee-report screen with mock data | Totals equal the sum of rows; numbers right-aligned with tabular figures; a fall in fees takes the color of its declared good direction; a zero prints as `0`; sample values appear in the Handoff Summary. See [Sample figures](records/sample-figures.md) |
| Build a Finnomena request tracker | At 1440×900 the list (heading and at least three complete rows) and the add-request action are visible on load; a request's detail is reachable in one click. See [First screen](records/first-screen.md) |
| Build a Back Office fee-report screen with mock data (first screen) | At 1440×900 the per-fund table shows its heading and at least three complete rows on load, with no summary band repeating totals the table carries. See [First screen](records/first-screen.md) |
| Add Finnomena approvals to an existing themed React/CDS app (Look and fix) | Before Done the run screenshots its screen at 375px and 1440px, writes at least one critique round naming the widths and applies fixes; the report gives each round its own line and no numeric score. See [Look and fix](records/look-and-fix.md) |
| Build a Finnomena event page from a Reference Design, with no browser tool | The report cites `scripts/probe-page.mjs` results at 375px and 1440px: IBM Plex Sans Thai loaded for Thai and Latin text, the Finnomena logo present, the source brand absent; where Chrome cannot launch, the runner's `not run` line. See [Browser probe runner](records/browser-probe-runner.md) |
| Colors-only restyle of a Tailwind v4 app whose disabled text must keep a stock utility | The run executes the shipped source lint on its changed files and the report fixes or justifies each warning on a `Source lint:` line. See [Source lint](records/source-lint.md) |
| Review this Finnomena back office screenshot (generated-dashboard habits, Neon navy and indigo present) | Findings name habit rows with visible evidence and give CDS or composition fixes; Neon navy structure and indigo links are not flagged as habits; no file edited. See [Functional screen habits](records/functional-screen-habits.md) |
| Finnomena fund-fee table at 375px | Below about 640px each fund is a two-line row (identity and key figure, then labeled secondary fields); every value shown at 1440px is visible at 375px; no sideways-scrolling table. See [Functional screen habits](records/functional-screen-habits.md) |
| Finnomena event page and Back Office approvals screen, baseline against revised skills (blind) | A judge who cannot tell the packages apart prefers one output per pair, or neither, at 375px and 1440px and names problems with the Look and fix questions and habits table; no numeric score; never feeds readiness. See [Output quality (blind)](records/output-quality-blind.md) |

Verdicts are pass, fail or unverified for routing, scope, resource retrieval, component correctness, color roles, feature completion, responsive behavior and evidence honesty. Link actual artifacts. Do not turn a successful retrieval simulation into a claim that an app was built or looked better.

## Records

Each evaluation's fixture, prompts, runs, verdicts and limits live in their own file under `evals/skills/records/`:

- [September 2026 refactor evidence](records/september-2026-refactor-evidence.md)
- [Tailwind colors-only regression](records/tailwind-colors-only-regression.md)
- [shadcn on Tailwind v4 restyle](records/shadcn-on-tailwind-v4-restyle.md)
- [Browser probe in verification](records/browser-probe-in-verification.md)
- [Mock labeling](records/mock-labeling.md)
- [CDS rebuild](records/cds-rebuild.md)
- [Reference design evaluation](records/reference-design-evaluation.md)
- [Readiness](records/readiness.md)
- [Motion safety](records/motion-safety.md)
- [Sample figures](records/sample-figures.md)
- [Campaign Page content](records/campaign-page-content.md)
- [First screen](records/first-screen.md)
- [Look and fix](records/look-and-fix.md)
- [Browser probe runner](records/browser-probe-runner.md)
- [Source lint](records/source-lint.md)
- [Functional screen habits](records/functional-screen-habits.md)
- [Output quality (blind)](records/output-quality-blind.md)

To add one, create its file, append one row to the end of the table above and one entry to the end of this list. Parallel changes then meet only on those two lines.

## Running agent samples

Run Claude Code samples with `run-claude-case.mjs` and Codex samples with `run-codex-case.mjs`:

```sh
node evals/skills/run-claude-case.mjs --fixture <app> --case <ticket>-<arm>-<n> --ref <commit> \
  --dev-port <port> --prompt '/neon:neon-create … The dev server is already running at http://localhost:{port}.'
```

- **Same permissions for every arm.** The runner gives every sample one allowlist of read and build commands, never unrestricted Bash, and a system-prompt note that a denied command blocks only that command. Without the note, runs read one denied compound command as "the shell is blocked" and stopped before building or looking. It writes both to the case folder; quote them in the record.
- **Baselines by commit.** `--ref` packages the plugin from that commit's own packager; record the commit in the record.
- **Browser tool.** The runner passes `browser-mcp.mjs` (navigate, resize, evaluate, screenshot, console; screenshots come back as images the agent can see). It needs `npm ci --prefix evals/templates`. Each call stops after 60 seconds, so an `evaluate` awaiting a promise that never settles returns an error instead of stalling the run.
- **Denials.** `summary.json` lists every denied command. A denial voids a sample only when it stopped the build or the look; say for each sample whether it did.
- **Cap and ports.** A run stops at 45 minutes (`--cap`); a run stopped there with no report is unverified, not failed. Give parallel runs their own `--dev-port`.
- **Evidence.** Case folders default to `.local/evals/<case>/`, which is never tracked. Cite those paths in the record.

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
