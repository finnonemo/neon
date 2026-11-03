# Starter workspace shell

`AppShell` and `ContentLayout` in both the Neon registry and the CDS starter use order-history chrome: mobile bottom navigation below 500px, a 64px icon rail from 500px through 1279px, and a 240px sidebar from 1280px. Other starter layouts keep their existing geometry. This is a maintained structural override in the starter stylesheet, not a change to the raw breakpoint exports or provisional color mapping.

The header stays above each pane's independently scrolling body. Supply `contentHeader`, `contentActions`, `inspectorHeader`, and `inspectorActions` as React nodes. Actions remain app-owned, including their labels and handlers. For example:

```tsx
<AppShell
  sidebar={null}
  contentHeader={<Text font="headline">รายการคำขอ / Requests</Text>}
  contentActions={<IconButton name="search" accessibilityLabel="ค้นหาคำขอ" onClick={openSearch} />}
  inspectorHeader={<Text font="headline">รายละเอียด / Details</Text>}
  content={requestList}
  inspector={requestDetails}
/>
```

`Text` comes from `@coinbase/cds-web/typography`; `IconButton` comes from `@coinbase/cds-web/buttons`. The example's handler and content belong to the app. Header rows have a 64px minimum height and can grow for wrapped Thai/English text. Omitted slots preserve existing callers.

Inspector behavior is intentionally preserved: below 988px, content and inspector switch as separate views with a back control; at wider widths both panes use their existing placement and widths. Selection, form state, scroll retention and focus return continue through `ResponsivePanes`. No right-hand overlay or drawer was added.

## Divider policy

Functional layouts use the existing border role beneath pane headers and at visible pane boundaries. AppShell and ContentLayout separate navigation from the workspace and the two adjacent content/detail panes. SimpleLayout separates sidebar and content. MultiColumnLayout separates sidebar and board, then each pair of adjacent columns; the last column has no trailing divider. Borders stay inside declared pane widths. Hidden sidebars and single-pane compact views leave no vertical divider behind.

ImmersiveLayout has no sidebar or adjacent functional pane boundary. It opts out of the border on the reused InspectorView's empty toolbar. Bottom navigation keeps its existing top border.

The user confirmed the shared rule for Neon and CDS and the inter-column board dividers before implementation. The header slots and workspace chrome use each implementation's own controls and theme; the apps do not mix component libraries.

## Reference and evidence boundary

Inspected the authenticated Finnomena order-history page in the user's Chrome on 3 November 2026. Browser screenshots at 375px, 768px, the original viewport and 1440px established the observed chrome. The page's rendered CSS declared 500px and 1280px navigation thresholds, a 64px header and a 240px wide sidebar. No account identifiers or order records are copied into the starter or tests.

The initial REA connection failed because Chrome remote debugging was disabled and the recorded port file was stale. After explicitly approved temporary enablement, REA discovery succeeded through the current browser WebSocket (`ev_d3c5cef0ca4f2fab1d99b420d2407b399108763a8a3026d67c09a2d78e8cd95f`). REA CLI 6.8.0 passively inspected the page DOM/accessibility (`ev_3bd5c340d71b27a239b31b84ab63dadf552001ad57aef826a0bd1b6fe1dd06f4`), and REA MCP captured the visible viewport (`ev_35bce28b46946ccdb43aa071c587f8f8ecc785d5094496e693f1e12e32ec7f83`). This corroborates the navigation/main/detail structure; the exact responsive CSS measurements above remain connected-browser evidence. MCP `inspect_web_page` still hit its fixed discovery deadline; the working inspection path used the installed CLI without changing MCP configuration. The passive inspection is origin-filtered and attach-window limited, excludes prior traffic and raw cookies/storage values, and does not establish unobserved interactions. Remote debugging was disabled again after inspection. Reference mobile inspector takeover and desktop right-side details are observations only; the implementation preserves the starter's existing inspector behavior as requested. Full-width starter navigation retains visible labels for usability rather than copying the reference's icon-only links.

The [browser suite](../../evals/templates/README.md) checks both three-pane layouts, header actions, independent scrolling, rail/sidebar thresholds, narrow-screen overflow and the existing inspector state/focus behavior. Disposable builds and screenshot comparisons are local evaluation artifacts, excluded from the shipped source.
