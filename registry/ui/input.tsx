import * as React from "react"

import { cn } from "@/lib/utils"

// Core's Text field at Large: a 56px Field on Field/field with 8px corners, body type, and no
// stroke at rest. A state draws its stroke inside the field: 3px in Focus/focus while it has
// focus, 3px in Support/support-error on the page background while invalid (focus shows over
// it), and 2px in Border/border-subtle on the page background when read-only. Hover and press
// take Field/field-hover (Core's Pressed; it has no Hover state). Disabled takes Core's disabled
// fill and text, with no opacity. A text field with focus on the web is being edited, Core's
// State=Focus; Core's ring outside a focused field that is not being edited, and its Active
// state, have no web state here until Core says when each shows.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-md bg-field px-4 text-body text-foreground transition-[background-color,outline-color] placeholder:text-placeholder hover:bg-field-hover",
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

export { Input }
