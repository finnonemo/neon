# CDS rebuild

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

`--shots` builds into `.local/shots`, copies the probe there and adds the `eval-shots` preview server. In the browser, run `eval(await (await fetch('/browser-probe.js')).text())` at 375px and desktop. A hidden pane lays out at width 0. Viewport emulation (`resize_window` at 375×812 and 1440×900) measured true widths even with the pane hidden, so check `viewportWidth` either way. The probe ships with the skills as [browser-probe.js](../../../skills/neon-redesign/references/browser-probe.js), which the shared verification checklist's Measure step evaluates; these evals use that copy. It reports page overflow, content scrolled sideways at load, sideways-scrolling containers, text counts per font, contrast on dark-background controls, rounded fills within 1.1:1 of what is behind them with no border or shadow (`sameAsParentFill`), nav underlines and dialog fit, naming each element measured. Colors are composited on a canvas, so `oklch()` and translucent fills measure as drawn; until 27 October contrast read `oklch()` channels as `rgb()` and put shadcn v4 controls at 1:1. On the recorded health-check samples at 375px it flagged the first sample's black "Home" label on navy (1.16:1), the sideways-scrolling columns of the second and fourth, and the third's underlined bottom nav; the fifth came back clean. Serif detection was first checked only against an unstyled element injected into the third sample's page, whose `<body>` computes to `Times`; the headless run below found r3's real desktop nav labels in `Times`. Content overflowing a fixed-width container, such as r2's nav labels past the rail, is not detected. Contrast is read from the control's own `color`, only for controls with text or an SVG icon; nav underlines count only on links with text. Before this rule, bs-s5's empty gauge-dot buttons read 1:1 and the starter's image-only Logo link read as an underlined nav link. With both rules, the probe at 375px still flagged r1 to r4 as above, since r3's icon-font glyphs count as text. It also found r2 and r4 loaded already scrolled sideways, by 30px and 52px. On the re-sample's hc-s1 and hc-s3, icon-only bottom nav links read 1.93:1 (default link blue on navy) while their glyphs render white. Inventory items, interactions and dialogs stay manual.

Without the preview pane, `node evals/skills/run-probe.mjs` serves each build in `.local/shots` and runs the probe in headless Chromium at 375px and 1440px in light mode, printing one line per build and width (`--json` for the full result, names to limit the builds). `--scheme dark` sets `prefers-color-scheme`, and `--dark-class` adds `dark` to `<html>` after load. It uses Playwright from `evals/templates`, so run `npm ci --prefix evals/templates` first. `--fixture` checks the probe against [probe-fixture.html](../probe-fixture.html), whose expected ids cover each filter above, and whose expected contrast values catch a misread color, in light and again with both dark switches; the template-browser workflow runs it whenever the probe changes, then grades the unmodified restyle fixture as its own result and probes it with `--dark-class`. On 27 October the headless run repeated the 375px results above for r1 to r5 and bs-s4 to s6, including r2's 30px and r4's 52px scroll. At 1440px it found five of r3's side-nav labels in `Times` ("Home", "Search", "Analytics", "Insights", "Notifications"), which the evaluator confirmed in the preview pane; the r1 to r5 results recorded above were measured at 375px only.

Control requests on the same fixtures must keep the existing stack: `$neon-create Colors only: switch this app's colors to Finnomena colors. Keep the layout, components, spacing and behaviour exactly as they are.` on both, and on health-check the status-filter task from the [flow refactor protocol](../flow-refactor-protocol.md) adapted to its statuses: `$neon-create Add a Finnomena status filter to this existing customer list. Offer All, New, In Progress, Ready to Report, Completed; combine it with the existing search, show an empty message when nothing matches, preserve services, providers, theme, routes and detail behavior. Keep Thai/English text usable on mobile and desktop.`

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

## Re-sample, 26 October 2026

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

## Re-run after PR #24, 26 October 2026

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
