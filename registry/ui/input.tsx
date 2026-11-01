import * as React from "react"

import { cn } from "@/lib/utils"

// The CDS TextInput's field: 56px, 8px corners, the heavy line role, body type.
// Disabled fades the field to half, as CDS does; its colors stay.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-md border border-input bg-background px-4 py-4 text-body text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
