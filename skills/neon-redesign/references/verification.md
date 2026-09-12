# Verify UI changes

Use this checklist for creation, restyling and composition changes. Check the affected task and integration points; do not run a whole-app review for every edit. Report each relevant check as passed, failed or unverified with actual evidence.

## Shared checklist

1. **Build and typecheck.** Run discovered project commands relevant to the change. Investigate failures; do not claim completion with a failing required check.
2. **Inspect rendered output.** Use the existing preview or start the app through its reviewed command. Confirm intended Finnomena roles and composition are visible, not merely declared in source. Use the user's viewport requirements; otherwise sample 375px and 1440px plus an affected layout transition. Test existing/requested color schemes, not newly invented dark mode.
3. **Exercise the main task.** Test relevant interactions and states with disposable data: input/validation, filter/selection, pending, empty, failure/recovery and success. Confirm keyboard reachability, visible focus, names and label/error relationships. Check dialogs/portals and focus return if touched. Never change real records just to test feedback.
4. **Check content and integration.** Inspect Thai/English labels, wrapping, overflow and access to collapsed controls. When typography changes, verify font resources and actual Thai/Latin rendering; a declared family alone does not establish glyph loading. Check new console/runtime errors. Respect reduced motion when motion is changed.
5. **Report evidence and limits.** List what changed, actual commands/results, inspected viewports/themes/states and remaining mock or unavailable behavior. Missing browser access means visual/runtime checks remain unverified; provide a concrete local recheck instead of pretending a source review passed them.

## Creation additions

Confirm requested content and actions exist beyond the scaffold. Use existing service contracts; label mock behavior visibly only when the user explicitly requested a demo or mock-labeled build, otherwise disclose it in the delivery report instead of the shipped UI. Test routes and shared navigation where the feature connects to the existing app. Check relevant state handling rather than adding every possible state to every component.

## Restyling additions

Compare before/after at the same viewport, mode and state. Confirm rendered styles match intended semantic roles. Preserve handlers, navigation, service calls and data meaning. For partial scope, inspect representative unrelated consumers of shared styles and compare their appearance/behavior. Report changed shared tokens and intentional exceptions; do not claim unvisited routes were verified.

Colors-only preserves fonts, spacing, radius and geometry. Token-driven typography changes may affect wrapping; check them rather than assuming identical layout.

## Composition additions

When `composition: 'adapt'`, compare task access and reading/focus order before/after; geometry changes are expected within scope. Confirm controls remain reachable on narrow screens, selected/filter state survives relevant interactions, and routes, handlers, services and data meaning remain intact. Do not require pixel equality inside the adapted container. Outside the requested scope, check for unintended changes as in restyling.

## Completion

The change is verified when relevant build checks pass, intended UI/task behavior is observed, scope preservation is supported by evidence, and limitations are reported. Any unavailable required check remains explicitly incomplete. A screenshot, a passing build or a link-check result alone cannot prove all four.
