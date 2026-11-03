import type { ReactNode } from "react";
import { Box } from "@coinbase/cds-web/layout";
import type { InspectorPane } from "./layoutPanes";

/** Fill pane with an optional content cap, toolbar and independently scrollable body. */
export function InspectorView({ pane, children, toolbar, headerDivider = true }: {
  pane: InspectorPane; children: ReactNode; toolbar?: ReactNode; headerDivider?: boolean;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, height: "100%" }}>
      <div style={{ maxWidth: pane.capAt, marginInline: pane.capAt ? "auto" : undefined,
        height: "100%", display: "flex", flexDirection: "column" }}>
        <Box borderedBottom={headerDivider} data-pane-control style={{ minHeight: 64, flexShrink: 0, display: "flex", alignItems: "center", paddingInline: 16 }}>
          {toolbar}
        </Box>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
