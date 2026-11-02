# Rebuild an existing React app on the Neon base

Read only when the employee explicitly asks to rebuild or move a whole existing React app onto Neon, the Neon base, the Finnomena starter or CDS ("rebuild this with Neon", "ย้ายทั้งแอปไป CDS"). A rebuild always targets the Neon base, since CDS is frozen for apps already on it; a request that names CDS gets the Neon base and one line saying why. Feature, colors-only and "make it Finnomena" requests keep the existing stack; non-React apps use the CSS path. The existing app is the spec; the result is a new app created from the Neon base.

## Prepare

1. **Check the source.** Mock data and simulated services proceed. A real backend, authentication or shared service contract gets one question: rebuild, or migrate incrementally per [CSS-to-CDS migration](../../neon-audit/references/theme-integration.md#css-to-cds-migration).
2. **Choose a new destination.** Use an empty sibling directory such as `<app>-neon` and create it per [scaffold](scaffold.md). The source app stays read-only: no edits, deletions or dependency changes.
3. **Write the parity inventory** in the conversation: every route and screen, feature and action, filter and search, list/form state (loading, empty, no-match, error, success), user-facing text in each language, displayed data and status meanings, responsive rules (each element the source hides, resizes or rearranges at a breakpoint, such as `.phc-add-column-zone { display: none }` under the mobile media query or columns sized at `100vw`), and timed or simulated demo behavior. Done when every source route has been opened (in a browser when available) and each item names its source location.

## Build

- **Carry logic over verbatim.** Copy mock data, services and API clients, pure filter/calculation modules and their tests. When logic sits inside a component, extract it unchanged first. The base is strict TypeScript without `allowJs`: rename copied modules to `.ts` and add types only. Copied tests keep their original runner; add only that runner and its script.
- **Rewrite only the UI** per [feature implementation](new-ui-workflow.md). Composition is `adapt`: choose the starter layout by task, keeping routes, handlers, data meaning and bilingual text.
- **Leave the source UI stack behind.** The result contains no source UI library (Carbon, MUI, Sass), none of their classes or stylesheets, no source shadcn component and no CDS. Tailwind stays as the base's, but the source's stock palette and size classes do not. Every component comes from a Neon item added per [Neon base](neon-base.md#add-neon-items), never a stock shadcn item. Where Neon lacks a component, compose Neon items and plain elements. Style through props and Neon roles; new stylesheets cover only app-owned elements per the [styling rule](neon-base.md#styling). The base supplies the reset. Non-UI libraries such as date or chart packages may stay when Neon has no equivalent; report each.
- **Carry each responsive rule into the rebuild.** Recheck copied effects that depend on layout at each width: a scroll-to-end effect on a container that now overflows loads it scrolled sideways and clips its left edge.
- Keep the base's `AppRoot`, fonts and color-scheme setup.

## Verify

Apply the [shared checklist](../../neon-redesign/references/verification.md#shared-checklist) with its creation and composition additions, then:

- Walk the parity inventory with the source and the rebuild side by side. Done when every item is ported or reported as not ported with its reason.
- Copied tests and the build pass; a search of the new app finds no source UI library import, package or class, no CDS and no file in `src/components/ui/` that is not a Neon item.
- The source app is unchanged (`git status` or a file comparison).
- Test every color scheme the rebuild exposes. `AppRoot`'s `colorScheme` defaults to light, so dark mode stays unverified unless the employee asks to wire it.

Report the destination, inventory results, the `@neon/` items added, retained non-UI libraries and the remaining steps to switch over.
