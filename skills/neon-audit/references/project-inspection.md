# Project inspection

Read only sections needed to resolve missing evidence. Inspection is read-only and scoped to app source/config; exclude dependencies, build output, caches, coverage and `.git`. Reuse known context. This is targeted inspection, not a full style audit.

## Multiple apps

Use the named app or a working directory inside a clear app. Otherwise inspect workspace configuration and candidate manifests. A root `package.json` may describe workspace tooling, not the target application. If multiple plausible apps remain, ask which one before inspecting or changing their internals. Do not choose by size or alphabetical order.

## Framework and dependencies

Read the target manifest, lockfile and actual entry/imports. Confirm React, Vue, Svelte or other framework from active code, not an unused dependency. Unknown stays unknown. Record package manager from lockfile/workspace settings and available build/typecheck commands. Compare installed React/CDS versions with required APIs before changing dependencies; a major mismatch is a migration decision, not permission to upgrade.

CDS is the React implementation path. For non-React targets, keep the existing framework and use CSS tokens. Explicit colors-only scope wins even when CDS is installed. If a framework choice is explicit and unsupported by the starter, say so rather than silently substituting React.

## Existing theme

Inspect the active entry/theme imports and provider tree, not just filenames. Record relevant paths, theme directory, styling syntax and theme-mode owner. A working Finnomena installation should be reused. A `theme.css` file neither proves it is imported nor requires an upgrade.

For CDS, locate `MediaQueryProvider`, `ThemeProvider`, `ComponentConfigProvider`, `PortalProvider` and the theme passed to them. Hand off existing locations so implementation updates that wiring only if needed, never adds duplicate providers. For CSS, inspect variable scope and the app's selectors. Preserve customized declarations and existing font loader. Examine source types in the installed package when API support is uncertain.

## Server-rendered React

Identify server/client boundaries, the existing client provider component and where global styles are legal in this framework. Keep providers inside the appropriate existing client boundary; do not convert the entire app to client rendering just to add a theme. Preserve SSR style setup, routing and hydration behavior. Record uncertainty when framework-specific setup needs investigation.

## Partial scope

Trace affected styles to their consumers. A local CSS rule may be safe to edit; a root variable consumed elsewhere is a scope conflict. Record that conflict in `preserve` and choose a local override. Do not import a global theme for a header-only change. For explicitly requested composition adaptation, identify the named container and preserve routes, handlers, services, data meaning and essential actions outside and inside it.

## Missing facts and handoff

Use the [shared contract](workflow-contract.md#handoff-data). Carry known target, tier, surface/composition when established, preserved behavior and verification commands. Leave unknowns explicit; investigate only those affecting the next action. Recommend one path, and ask only for unresolved target/adoption/scope choices. Assessment-only ends at the recommendation; an implementation request continues through its chosen skill.
