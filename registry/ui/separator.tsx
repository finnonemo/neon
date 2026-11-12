import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Divider: a 1px line in Border/border-subtle (--border), with no margin of its own.
// Horizontal fills its container's width; inset="start" is Core's Inset=Start, the line
// starting 16px in, under a row's text. Core's Divider is horizontal only: vertical keeps
// working, the same line stretched to its row's height. Decorative by default, so screen
// readers skip it; pass decorative={false} for a semantic role=separator. Radix sets
// data-orientation, which radix-nova's data-horizontal: classes never match.
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  inset = "none",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & { inset?: "none" | "start" }) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      data-inset={inset}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        "data-[orientation=horizontal]:data-[inset=start]:ms-4 data-[orientation=horizontal]:data-[inset=start]:w-[calc(100%-1rem)]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
