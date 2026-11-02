# Project inspection

Read only sections needed to resolve missing evidence. Inspection is read-only and scoped to app source/config; exclude dependencies, build output, caches, coverage and `.git`. Reuse known context. This is targeted inspection, not a full style audit.

## Multiple apps

Use the named app or a working directory inside a clear app. Otherwise inspect workspace configuration and candidate manifests. A root `package.json` may describe workspace tooling, not the target application. If multiple plausible apps remain, ask which one before inspecting or changing their internals. Do not choose by size or alphabetical order.

## Framework and dependencies

Read the target manifest, lockfile and actual entry/imports. Confirm React, Vue, Svelte or other framework from active code, not an unused dependency. Unknown stays unknown. Record package manager from lockfile/workspace settings and available build/typecheck commands. Compare installed React/CDS versions with required APIs before changing dependencies; a major mismatch is a migration decision, not permission to upgrade.

New React work goes on the Neon base, and an app already on React keeps its [base](#base). For non-React targets, keep the existing framework and use CSS tokens. Explicit colors-only scope wins whatever the base. If a framework choice is explicit and unsupported by the starter, say so rather than silently substituting React.

## Base

Tell the base from the manifests, as neon-create does:

- **Neon base:** `components.json` has an `@neon` registry entry. Its components are Neon registry items, styled by the rules in [Neon base](../../neon-create/references/neon-base.md).
- **CDS:** `package.json` depends on `@coinbase/cds-web`. CDS is frozen for apps already on it: they keep CDS, styled as [CDS integration](../../neon-create/references/cds-integration.md) describes.
- **Neither:** no `@neon` entry and no CDS. A `components.json` without `@neon` is plain shadcn (v0, Lovable): it keeps its own components and is restyled through its CSS variables; it takes `@neon/` items only for components the request asks for, through neon-create.

An app with both an `@neon` entry and CDS is mixed: report it as unresolved and add to neither side. Restyle and review keep the app on its base; a new React app starts on the Neon base. The base an app is on is not a finding. Without source, such as from a screenshot alone, the base is unknown; say so.

## Existing theme

Inspect the active entry/theme imports and provider tree, not just filenames. Record relevant paths, theme directory, styling syntax and theme-mode owner. A working Finnomena installation should be reused. A `theme.css` file neither proves it is imported nor requires an upgrade.

For CDS, locate `MediaQueryProvider`, `ThemeProvider`, `ComponentConfigProvider`, `PortalProvider` and the theme passed to them. Hand off existing locations so implementation updates that wiring only if needed, never adds duplicate providers. For CSS, inspect variable scope and the app's selectors. Preserve customized declarations and existing font loader. Examine source types in the installed package when API support is uncertain.

## Server-rendered React

Identify server/client boundaries, the existing client provider component and where global styles are legal in this framework. Keep providers inside the appropriate existing client boundary; do not convert the entire app to client rendering just to add a theme. Preserve SSR style setup, routing and hydration behavior. Record uncertainty when framework-specific setup needs investigation.

## Partial scope

Trace affected styles to their consumers. A local CSS rule may be safe to edit; a root variable consumed elsewhere is a scope conflict. Record that conflict in `preserve` and choose a local override. Do not import a global theme for a header-only change. For explicitly requested composition adaptation, identify the named container and preserve routes, handlers, services, data meaning and essential actions outside and inside it.

## Missing facts and handoff

Use the [shared contract](workflow-contract.md#handoff-data). Carry known target, tier, surface/composition when established, preserved behavior and verification commands. Leave unknowns explicit; investigate only those affecting the next action. Recommend one path, and ask only for unresolved target/adoption/scope choices. Assessment-only ends at the recommendation; an implementation request continues through its chosen skill.
