# Scaffold a new app

Read only for a new project. The shipped starter is Vite + React + TypeScript. An explicit non-React request uses that framework's normal scaffold and Neon's CSS path; do not substitute React.

## Assemble and install

Resolve the requested empty destination, then run from the Neon root:

```sh
node "${CLAUDE_PLUGIN_ROOT}/scripts/install.mjs" <target-dir> --new
```

The installer assembles starter source plus canonical theme files and installs declared dependencies. It refuses nonempty destinations. `--skip-install` copies without installing; report dependencies as pending. Inspect the installer header for package-manager options. Never use this mode to add a feature to an existing app.

The starter wires `createNeonTheme()` and the providers and loads IBM Plex Sans Thai. Reuse its mode/font setup. Implement the requested content after assembly; empty Content/Inspector placeholders are not a deliverable.

## Starter layouts

Choose based on the task, not the default `App.tsx`:

| Export | Use |
| --- | --- |
| `AppShell` | List and selected-detail/action workspace |
| `ContentLayout` | Content-dominant workspace with supporting detail |
| `SimpleLayout` | Navigation and content without an inspector |
| `MultiColumnLayout` | Explicit board/kanban task |
| `ImmersiveLayout` | Focused, full-bleed content or landing page |

These are starter exports, not guaranteed imports in other apps. Inspect `src/layout/layoutPanes.ts` for corroborated versus extrapolated geometry. Supply navigation for actual destinations; ecosystem links are opt-in. Use the shipped `Logo` and SVG marks appropriate to the surface, not a recreated text wordmark.

## Rebuild an existing project

Use only when the employee asks to move an existing project onto the starter. The original project is a read-only spec; do not edit, move or delete it, and do not port its components or styles.

1. Inventory the original: screens and routes, content and copy, user flows, essential actions, data shapes and the services or mock data behind them.
2. Assemble the starter into a new empty destination as above.
3. Recompose each screen using the [design contract](../../INSTRUCTION.md#composition) for its functional or immersive surface, rather than copying the original layout. Keep the content, flow, data shape and every essential action.
4. Reconnect the same services. Where the original used mock data, keep it visibly mocked.
5. Report a mapping from each original screen and action to its new location, plus anything not carried over and why.

## Finish the feature

Follow [feature implementation](new-ui-workflow.md) and [verification](../../neon-redesign/references/verification.md). Use functional or immersive visual direction independently of the chosen framework; colorful immersive surfaces do not require a different component library.
