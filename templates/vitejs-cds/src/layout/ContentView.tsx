import type { ReactNode } from "react";
import { Box } from "@coinbase/cds-web/layout";

/** Fixed-width or full-width pane with a toolbar and independently scrollable body. */
export function ContentView({ width, children, toolbar, capAt, divider = false }: {
  width: number | string; children: ReactNode; toolbar?: ReactNode; capAt?: number; divider?: boolean;
}) {
  return (
    <Box borderedEnd={divider} style={{ width, maxWidth: capAt, marginInline: capAt ? "auto" : undefined, flexShrink: 0, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box borderedBottom data-pane-control style={{ minHeight: 64, flexShrink: 0, display: "flex", alignItems: "center", paddingInline: 16 }}>
        {toolbar}
      </Box>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
    </Box>
  );
}
