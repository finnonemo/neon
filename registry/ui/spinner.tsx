import * as React from "react"

import { cn } from "@/lib/utils"

// The CDS Spinner: a ring drawn in em, so size scales it whole, as in CDS. It
// is 10× size px wide with a 1.1× size border; the track (three sides) is
// bgAlternate (the accent slot) and the bottom arc takes the text color,
// fgMuted unless a text-* class recolors it. role=status with a visually
// hidden label, so assistive tech announces it politely.
function Spinner({
  className,
  size = 1.6,
  label = "Loading",
  style,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  /** CDS Spinner's size: the ring is 10× this many px wide (1.6 is 16px). */
  size?: number
  /** What assistive tech announces. */
  label?: string
}) {
  return (
    <span
      data-slot="spinner"
      role="status"
      className={cn(
        "inline-block size-[10em] shrink-0 animate-spin rounded-full border-[1.1em] border-accent border-b-current text-muted-foreground",
        className
      )}
      style={{ fontSize: size, ...style }}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}

export { Spinner }
