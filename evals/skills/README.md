# Skill behavior scenarios

Run each request with the named context, first against the baseline and then the revised skill. Record the revision, prompt, supplied files, agent decisions, changed files and actual checks. Use an isolated app for implementation runs. Do not supply the expected answer to a fresh evaluating agent.

| Request/context | Observe |
| --- | --- |
| Add Finnomena approvals to an existing themed React/CDS app; retain providers/routes/services | Reuses installation and shell; builds actual list/detail/actions; navy foundation, indigo selection, labeled statuses |
| Build a colorful Finnomena product landing page | Immersive composition permits prominent brand color/illustration; does not force navy/white dominance; actions remain accessible |
| Create a Finnomena request tracker with mock data | Scaffolds in an empty destination and builds the feature; demo behavior is visible; relevant states exist |
| Change only a Vue header to Finnomena colors | No React/CDS installation, font/layout changes or global theme side effects |
| Review this Finnomena screenshot; do not edit | Visible findings only; keyboard, other viewports and measured contrast remain unverified |
| Make the buttons clearer after Finnomena was established | Retains brand intent without repeated onboarding |
| Build a CDS settings screen with no Finnomena context | Does not infer Finnomena branding from CDS alone |
| Colors-only restyle of a Tailwind v4 app that uses stock utilities only | See [Tailwind colors-only regression](#tailwind-colors-only-regression) |
| Rebuild an existing React prototype on CDS; colors-only and feature requests on the same apps | See [CDS rebuild](#cds-rebuild) |

Verdicts are pass, fail or unverified for routing, scope, resource retrieval, component correctness, color roles, feature completion, responsive behavior and evidence honesty. Link actual artifacts. Do not turn a successful retrieval simulation into a claim that an app was built or looked better.

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
- Primary CDS buttons keep `fgInverse` text. Every stylesheet selector starts with an app class (`node evals/skills/stylesheet-scope.mjs <css files>`), and no rule reaches into CDS components.

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
  The browser check covered the dashboard, search and one dialog, not every parity inventory item. Like r4, the app renders its own header navigation, and no bottom nav appears at 375px.
- Controls kept their stacks. The health-check colors run bridged Carbon `--cds-*` variables with hex values; the status-filter run changed only `App.jsx` and `App.scss`, and its filter UI was not browser-checked. The batch-sell colors run skipped neon-redesign and aliased stock palette names with hex. After neon-create's entrypoint sent colors-only React restyles to neon-redesign, two more samples read style migration and passed the alias, role, focus and build items above. Each mapped the selected tab border to indigo. On the pale and marker items, one sample passed. The other failed: it turned a `bg-slate-400` hairline into the near-white `bgPrimaryWash`. On adapter variables, that second sample passed by importing the adapter. The first is borderline: it copied the adapter's `rgb()` declarations into `:root`. Neither sample was browser-checked.
- Limits:
  - Single samples, Codex only.
  - The user-level `ponytail` skill leaked into every run.
  - Four first-round runs could list their `CODEX_HOME` through `--add-dir`.
  - Dark mode is unverified, because the starter fixes light.
  - Dialogs, timers and keyboard focus in the rebuilds were checked only through the runs' DOM tests.

## Flow refactor evaluation

See [the paired evaluation protocol](flow-refactor-protocol.md) for exact prompts, fixture boundaries, measurements and acceptance. Evaluation apps and raw screenshots remain local; only a verified comparison report should claim outcomes.
