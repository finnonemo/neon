import * as React from "react"

import { cn } from "@/lib/utils"

// The CDS TextInput's multiline field: three body lines with 16px padding make
// its 100px. Disabled fades to half, as CDS does.
function Textarea({ className, rows = 3, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(
        "flex w-full rounded-md border border-input bg-background p-4 text-body text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
