import type { ReactNode } from "react"

// The CDS fixture's measuring hooks: display: contents, so they never change the layout they mark.
export const Hook = ({ name, children }: { name: string; children: ReactNode }) =>
  <div data-measure={name} style={{ display: "contents" }}>{children}</div>
