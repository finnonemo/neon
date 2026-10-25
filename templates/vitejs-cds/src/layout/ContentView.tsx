import type { ReactNode } from "react";

/** Fixed-width or full-width pane with a toolbar and independently scrollable body. */
export function ContentView({ width, children, toolbar, capAt }: {
  width: number | string; children: ReactNode; toolbar?: ReactNode; capAt?: number;
}) {
  return (
    <div style={{ width, maxWidth: capAt, marginInline: capAt ? "auto" : undefined, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div data-pane-control style={{ minHeight: 64, flexShrink: 0, display: "flex", alignItems: "center" }}>
        {toolbar}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
    </div>
  );
}
