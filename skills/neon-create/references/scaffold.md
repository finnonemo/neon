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

## Content and details on narrow screens

`AppShell` and `ContentLayout` show one view below 988px: content first, then inspector, with a back control. At 988px and above both panes appear with their desktop geometry. Both stay mounted so local input and scroll state survive switching. This does not add routes or change services.

Existing callers can omit pane props and use the built-in “View details” / “Back to content” controls. For list selection, own the pane state alongside the existing selected-record state:

```tsx
const [activePane, setActivePane] = useState<"content" | "inspector">("content");

<AppShell
  sidebar={null}
  content={<RequestList onSelect={(request) => {
    setSelectedRequest(request);
    setActivePane("inspector");
  }} />}
  inspector={<RequestDetails request={selectedRequest} />}
  activePane={activePane}
  onActivePaneChange={setActivePane}
  paneLabels={{ content: "รายการ", inspector: "รายละเอียด",
    viewDetails: "ดูรายละเอียด", backToContent: "กลับไปที่รายการ" }}
/>
```

The list/detail components above belong to the app, not the starter. Controlled callers must update `activePane` in `onActivePaneChange`; the shell cannot infer selection from arbitrary children. Preserve the same component identities/keys and existing selection/filter state. The inspector should provide an empty-selection state when nothing is selected. Keyboard focus moves into details and returns to the content control that opened it, without scrolling the list back to the top.

All five layouts reserve space for visible mobile navigation and device safe areas. Empty navigation reserves no space. `AppRoot` accepts the app's existing `colorScheme`; default logos adapt to that scheme, while `Logo`'s explicit `tone` selects the asset for a custom surface.

## Finish the feature

Follow [feature implementation](new-ui-workflow.md) and [verification](../../neon-redesign/references/verification.md). Use functional or immersive visual direction independently of the chosen framework; colorful immersive surfaces do not require a different component library.
