# Verify UI changes

Use this checklist for creation, restyling and composition changes. Check the affected task and integration points; do not run a whole-app review for every edit. Report each relevant check as passed, failed or unverified with actual evidence.

## Shared checklist

1. **Build and typecheck.** Run discovered project commands relevant to the change. Investigate failures; do not claim completion with a failing required check.
2. **Inspect rendered output.** Use the existing preview or start the app through its reviewed command. Confirm intended Finnomena roles and composition are visible, not merely declared in source. Use the user's viewport requirements; otherwise sample 375px and 1440px plus an affected layout transition. Test existing/requested color schemes, not newly invented dark mode.
   - **Measure** with the [browser probe](browser-probe.js) when a browser tool can evaluate JavaScript: read the probe from this directory and evaluate its text on the rendered page at 375px and 1440px. Confirm the reported `viewportWidth` equals each width; a hidden pane reports 0, which voids that run. Cite the elements it names for page overflow, content scrolled sideways at load, sideways-scrolling containers, text per font, control contrast on dark fills, fills that blend into their background, nav underlines and dialog fit, and inspect each before calling it a defect. Do not copy the probe into the app or serve it from the app. Without such a tool, report the probe as not run, mark these checks unverified and give the probe at 375px and 1440px as the recheck.
3. **Exercise the main task.** Test relevant interactions and states with disposable data: input/validation, filter/selection, pending, empty, failure/recovery and success. Confirm keyboard reachability, visible focus, names and label/error relationships. Check dialogs/portals and focus return if touched. Never change real records just to test feedback.
4. **Check content and integration.** Inspect Thai/English labels, wrapping, overflow and access to collapsed controls. When typography changes, verify font resources and actual Thai/Latin rendering; a declared family alone does not establish glyph loading. Check new console/runtime errors. When motion is added or changed, including motion taken from a reference design, motion must never hide content. The main heading is readable at first paint, not faded or typed in, and under `prefers-reduced-motion: reduce` every section is visible as soon as it is scrolled into view, without waiting for an animation or a reveal script. No element's hidden starting state (zero opacity, `visibility: hidden`, off-screen transform) may live in CSS waiting for a script, scroll observer or animation library to reveal it; start it visible, or hide it only under a class the script adds, so a late or failed script leaves content visible. Emulate reduced motion where the browser tool supports it; otherwise cite the CSS and script that keep content visible and mark the rendered check unverified.
5. **Report evidence and limits.** List what changed, actual commands/results, inspected viewports/themes/states and remaining mock or unavailable behavior. Missing browser access means visual/runtime checks remain unverified; provide a concrete local recheck instead of pretending a source review passed them. Give the browser probe its own report line: `Browser probe: 375px <what it flagged, or clean>; 1440px <…>`, or `Browser probe: not run; recheck at 375px and 1440px`.

## Look and fix

After items 1–4 and before reporting, look at your own screenshots and fix what a user would notice. A passing build or a clean probe is not this check.

1. **Screenshot** the main task's screen at 375px and 1440px in its relevant states, such as loaded, selected, empty and error, in each existing or requested color scheme.
2. **Critique** the screenshots in writing. Write each problem as a finding in [neon-review's shape](../../neon-review/SKILL.md#done): severity, location, evidence (the screenshot's width and state), who is affected and how, fix and recheck. Ask:
   - Is the main task's answer the most prominent, first-read element, per [one question, first screen](../../neon-create/references/new-ui-workflow.md#one-question-first-screen)?
   - Do neighboring blocks share edges and gutters?
   - Are color roles as the [design contract](../../INSTRUCTION.md#color-roles) assigns them?
   - Does Thai text wrap without clipping or overlapping?
   - At 375px, can the user still reach the main task and its details?
   <!-- Functional screen habits table (#54): link it here when it exists. -->
3. **Fix** the top three problems, ranked in this order: task hierarchy, composition and edges, typography and wrapping, color roles, states and focus, motion. Take new screenshots at the same widths and states and recheck. Stop after three rounds, or when a round finds nothing a user would notice.
4. **Report** each round on its own line, `Look and fix, round 1 (375px, 1440px): <findings>; fixed <what changed>`, and list the problems that remain plainly.

Fix only within scope. Colors-only work fixes only color problems and reports the rest as observations. Under `composition: 'preserve'`, hierarchy and composition problems in existing UI are observations too; new UI you built is yours to fix. Do not score the screen: readiness follows work type, not visual quality.

Without screenshots you can see, never critique from source. Report `Look and fix: not run; recheck at 375px and 1440px` and name the screen and states to check.

## Creation additions

Confirm requested content and actions exist beyond the scaffold. Use existing service contracts; report mock behavior in the delivery report, or label it in the UI when the request asked for a demo. Test routes and shared navigation where the feature connects to the existing app. Check relevant state handling rather than adding every possible state to every component. For mock figures on a functional screen, check the [sample data rules](../../neon-create/references/new-ui-workflow.md#sample-data-and-figures): totals match their rows with no assertion error in the console, and the Handoff Summary lists the headline sample figures. For a new functional screen, check at 1440×900 that the list answering the main question shows its heading and three complete rows on load, no summary band repeats totals the list already carries unless the request asked for one, and the most frequent action is visible, per [one question, first screen](../../neon-create/references/new-ui-workflow.md#one-question-first-screen).

## Restyling additions

Compare before/after at the same viewport, mode and state. Confirm rendered styles match intended semantic roles. Preserve handlers, navigation, service calls and data meaning. For partial scope, inspect representative unrelated consumers of shared styles and compare their appearance/behavior. Report changed shared tokens and intentional exceptions; do not claim unvisited routes were verified.

Colors-only preserves fonts, spacing, radius and geometry. Token-driven typography changes may affect wrapping; check them rather than assuming identical layout.

## Composition additions

When `composition: 'adapt'`, compare task access and reading/focus order before/after; geometry changes are expected within scope. Confirm controls remain reachable on narrow screens, selected/filter state survives relevant interactions, and routes, handlers, services and data meaning remain intact. Do not require pixel equality inside the adapted container. Outside the requested scope, check for unintended changes as in restyling.

## Completion

The change is verified when relevant build checks pass, intended UI/task behavior is observed, scope preservation is supported by evidence, and limitations are reported. Any unavailable required check remains explicitly incomplete. A screenshot, a passing build or a link-check result alone cannot prove all four.
