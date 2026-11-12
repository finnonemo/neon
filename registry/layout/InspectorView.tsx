import type { ReactNode } from "react";
import type { InspectorPane } from "./layoutPanes";

/**
 * Fill pane with an optional content cap, toolbar and independently scrollable body.
 * `scroll="window"` is for a layout whose page scrolls with the window (a themed
 * ImmersiveLayout): the body is then no scroll container, so `position: sticky`
 * inside it pins to the viewport.
 */
export function InspectorView({ pane, children, toolbar, headerDivider = true, scroll = "pane" }: {
  pane: InspectorPane; children: ReactNode; toolbar?: ReactNode; headerDivider?: boolean; scroll?: "pane" | "window";
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, height: "100%" }}>
      <div style={{ maxWidth: pane.capAt, marginInline: pane.capAt ? "auto" : undefined,
        height: "100%", display: "flex", flexDirection: "column" }}>
        <div className={headerDivider ? "border-b border-border" : undefined} data-pane-control style={{ boxSizing: "border-box", minHeight: 64, flexShrink: 0, display: "flex", alignItems: "center", paddingInline: 16 }}>
          {toolbar}
        </div>
        <div style={scroll === "pane" ? { flex: 1, minHeight: 0, overflowY: "auto" } : { flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
