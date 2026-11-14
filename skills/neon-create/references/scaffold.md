# Scaffold a new app

Read only for a new project. A new app starts on the Neon base: Vite, React 19, TypeScript, Tailwind v4 and Neon's tuned shadcn/ui components from the Neon registry. An explicit non-React request uses that framework's normal scaffold and Neon's CSS path; do not substitute React.

## Create the app

Resolve the requested destination, then run from the Neon root:

```sh
node "<Neon root>/scripts/install.mjs" <target-dir> --new
```

The installer runs the pinned shadcn CLI's `init` from the Neon base item of the registry pinned to this release, then checks that every file landed. The destination may be missing or empty, anywhere, inside a repository too; the installer refuses a nonempty one. shadcn installs the dependencies with npm. Never use this mode to add a feature to an existing app.

The base adds the theme, Neon's `cn`, the starter layouts, `Logo`, `button`, `tooltip` and `sonner`. `AppRoot` owns the color scheme and holds the tooltip provider and toaster, and `main.tsx` loads IBM Plex Sans Thai. Reuse that setup. Add every other component the feature needs as a Neon item per [Neon base](neon-base.md). Implement the requested content after creating the app; the default `App.tsx` placeholders are not a deliverable.

## Starter layouts

Choose based on the task, not the default `App.tsx`:

| Export | Use |
| --- | --- |
| `AppShell` | List and selected-detail/action workspace |
| `ContentLayout` | Content-dominant workspace with supporting detail |
| `SimpleLayout` | Navigation and content without an inspector |
| `MultiColumnLayout` | Columns side by side, 400px each, that each scroll on their own: a board, or records compared in columns |
| `ImmersiveLayout` | Focused content or landing page; full-bleed except at the widest tier, where content caps at 1440px. `immersiveTheme` sets a Campaign Page's [Immersive Theme](../../INSTRUCTION.md#composition) |

Import them from `@/layout/<name>`. These are starter exports, not guaranteed imports in other apps. Inspect `src/layout/layoutPanes.ts` for corroborated versus extrapolated geometry. Supply navigation for actual destinations; ecosystem links are opt-in. A Back Office or Product Feature app takes the sidebar navigation unless the request says it stands alone: when the request does not say, ask the employee whether the product stands alone or is part of another product's screens, and which destinations its menu holds. Until they answer, pass `navigation` with the new screen as its active item and the destinations the request names, never invented ones, and repeat the question in the Done report. The sidebar holds that navigation and nothing that is a record: a list of advisors, requests or funds goes in content, in `AppShell`'s list pane with the record's detail beside it. Choose `AppShell` as soon as the task has a list and a detail, not `SimpleLayout`. Use the shipped `Logo` and SVG marks appropriate to the surface, not a recreated text wordmark.

## Content and details on narrow screens

`AppShell` and `ContentLayout` show one view below 988px: content first, then inspector, with a back control. At 988px and above both panes appear with their desktop geometry. Both stay mounted so local input and scroll state survive switching. This does not add routes or change services.

Existing callers can omit pane props and use the built-in “View details” / “Back to content” controls. For list selection, own the pane state alongside the existing selected-record state:

```tsx
const [activePane, setActivePane] = useState<"content" | "inspector">("content");

<AppShell
  sidebar={null}
  navigation={[{ label: "คำขอ", icon: Inbox, href: "/requests", active: true }]}
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

All five layouts reserve space for visible mobile navigation and device safe areas. Empty navigation reserves no space. `AppRoot` takes the app's `colorScheme` (`light` by default) and sets it as `data-theme` on `<html>`; default logos adapt to that scheme, while `Logo`'s explicit `tone` selects the asset for a custom surface.

## Finish the feature

Follow [feature implementation](new-ui-workflow.md) and [verification](../../neon-redesign/references/verification.md). Use functional or immersive visual direction independently of the chosen framework; colorful immersive surfaces do not require a different component library.
