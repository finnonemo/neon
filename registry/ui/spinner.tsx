import * as React from "react"

import { cn } from "@/lib/utils"

// Core's Progress circle, Inline and Indeterminate: a Ring stroked inside itself, the Track in
// Layer/layer-03 and a quarter arc in Miscellaneous/interactive. The arc takes the text color,
// so a text-* class recolors it. size is Core's Size: xs, sm, md, lg and xl are XSmall to
// XLarge, 15, 24, 36, 48 and 64px rings with 2, 3, 4, 4 and 4px strokes. A number is not in
// Core and keeps working: the ring is 10× that many px wide with a 1.1× border.
// role=status with a visually hidden label, so assistive tech announces it politely.
function Spinner({
  className,
  size = "xs",
  label = "Loading",
  style,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  /** Core's Size. A number draws the ring 10× that many px wide (1.6 is 16px): not in Core. */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number
  /** What assistive tech announces. */
  label?: string
}) {
  const scaled = typeof size === "number"
  return (
    <span
      data-slot="spinner"
      data-size={scaled ? "scaled" : size}
      role="status"
      className={cn(
        "inline-block size-[15px] shrink-0 animate-spin rounded-full border-2 border-track border-b-current text-interactive",
        "data-[size=sm]:size-6 data-[size=sm]:border-3 data-[size=md]:size-9 data-[size=md]:border-4 data-[size=lg]:size-12 data-[size=lg]:border-4 data-[size=xl]:size-16 data-[size=xl]:border-4",
        "data-[size=scaled]:size-[10em] data-[size=scaled]:border-[1.1em]",
        className
      )}
      style={scaled ? { fontSize: size, ...style } : style}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}

export { Spinner }
