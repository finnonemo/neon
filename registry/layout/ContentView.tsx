import type { ReactNode } from "react";

/** Fixed-width or full-width pane with a toolbar and independently scrollable body. */
export function ContentView({ width, children, toolbar, capAt, divider = false }: {
  width: number | string; children: ReactNode; toolbar?: ReactNode; capAt?: number; divider?: boolean;
}) {
  return (
    <div className={divider ? "border-e border-border" : undefined} style={{ boxSizing: "border-box", width, maxWidth: capAt, marginInline: capAt ? "auto" : undefined, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div className="border-b border-border" data-pane-control style={{ boxSizing: "border-box", minHeight: 64, flexShrink: 0, display: "flex", alignItems: "center", paddingInline: 16 }}>
        {toolbar}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
    </div>
  );
}
