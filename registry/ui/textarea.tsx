import * as React from "react"

import { cn } from "@/lib/utils"

// Core's Text area: Input's field at least 104px tall (three body lines) with 16px padding all
// round. Its states are Input's: the stroke a state draws is inside the field, and Disabled
// takes Core's disabled fill and text, with no opacity.
function Textarea({ className, rows = 3, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(
        "flex min-h-26 w-full rounded-md bg-field p-4 text-body text-foreground transition-[background-color,outline-color] placeholder:text-placeholder hover:bg-field-hover",
        "focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring",
        "aria-invalid:bg-background aria-invalid:outline-3 aria-invalid:-outline-offset-3 aria-invalid:outline-invalid aria-invalid:hover:bg-background aria-invalid:focus-visible:outline-ring",
        "[&[readonly]:enabled]:bg-background [&[readonly]:enabled]:outline-2 [&[readonly]:enabled]:-outline-offset-2 [&[readonly]:enabled]:outline-border [&[readonly]:enabled]:focus-visible:outline-3 [&[readonly]:enabled]:focus-visible:-outline-offset-3 [&[readonly]:enabled]:focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:bg-field-disabled disabled:text-disabled-foreground disabled:placeholder:text-disabled-foreground disabled:aria-invalid:bg-field-disabled disabled:aria-invalid:outline-0",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
