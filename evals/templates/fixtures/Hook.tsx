import type { ReactNode } from "react";

// A measuring hook: display: contents, so it never changes the layout it marks.
export const Hook = ({ name, children }: { name: string; children: ReactNode }) =>
  <div data-measure={name} style={{ display: "contents" }}>{children}</div>;
