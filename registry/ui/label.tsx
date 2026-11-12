import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Title above a field: Headline in Text/text-secondary, and Text/text-disabled (no
// opacity) when its field is disabled. Beside a radio or a switch, Core's Value is body in the
// text color: pass text-body text-foreground.
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-headline text-muted-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-disabled-foreground peer-disabled:text-disabled-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Label }
