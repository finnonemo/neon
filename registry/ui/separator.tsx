import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// The CDS Divider: a 1px line in the bgLine role (--border), with no margin of
// its own. Horizontal fills its container's width; vertical stretches to its
// row's height. Decorative by default, so screen readers skip it; pass
// decorative={false} for a semantic role=separator. Radix sets
// data-orientation, which radix-nova's data-horizontal: classes never match.
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
