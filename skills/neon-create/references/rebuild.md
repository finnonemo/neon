# Rebuild an existing React app on CDS

Read only when the employee explicitly asks to rebuild or move a whole existing React app onto CDS or the Neon starter ("rebuild this with CDS", "ย้ายทั้งแอปไป CDS"). Feature, colors-only and "make it Finnomena" requests keep the existing stack; non-React apps use the CSS path. The existing app is the spec; the result is a new app assembled from the starter.

## Prepare

1. **Check the source.** Mock data and simulated services proceed. A real backend, authentication or shared service contract gets one question: rebuild, or migrate incrementally per [CSS-to-CDS migration](../../neon-audit/references/theme-integration.md#css-to-cds-migration).
2. **Choose a new destination.** Use an empty sibling directory such as `<app>-cds` and assemble it per [scaffold](scaffold.md). The source app stays read-only: no edits, deletions or dependency changes.
3. **Write the parity inventory** in the conversation: every route and screen, feature and action, filter and search, list/form state (loading, empty, no-match, error, success), user-facing text in each language, displayed data and status meanings, and timed or simulated demo behavior. Done when every source route has been opened (in a browser when available) and each item names its source location.

## Build

- **Carry logic over verbatim.** Copy mock data, services and API clients, pure filter/calculation modules and their tests. When logic sits inside a component, extract it unchanged first. The starter is strict TypeScript without `allowJs`: rename copied modules to `.ts` and add types only. Copied tests keep their original runner; add only that runner and its script.
- **Rewrite only the UI** per [feature implementation](new-ui-workflow.md). Composition is `adapt`: choose the starter layout by task, keeping routes, handlers, data meaning and bilingual text.
- **Leave the source UI stack behind.** The result contains no source UI library (Carbon, Tailwind, their classes or stylesheets). Where CDS lacks a component, compose CDS primitives. New stylesheets scope every rule to app classes per the [cascade-layer rule](cds-integration.md#component-apis-and-tokens); CDS supplies the reset. Non-UI libraries such as date or chart packages may stay when CDS has no equivalent; report each.
- Keep the starter's providers, fonts and `AppRoot` color-scheme setup.

## Verify

Apply the [shared checklist](../../neon-redesign/references/verification.md#shared-checklist) with its creation and composition additions, then:

- Walk the parity inventory with the source and the rebuild side by side. Done when every item is ported or reported as not ported with its reason.
- Copied tests and the build pass; a search of the new app finds no source UI library import, package or class.
- The source app is unchanged (`git status` or a file comparison).
- Test every color scheme the rebuild exposes. The starter currently fixes `colorScheme` to light, so dark mode stays unverified unless the employee asks to wire it.

Report the destination, inventory results, retained non-UI libraries and the remaining steps to switch over.
