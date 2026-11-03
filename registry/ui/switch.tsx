import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// The CDS Switch: a 52x32 pill track with 1px of padding round a 30px thumb
// that slides 20px when checked. The track takes bgPrimary when checked and
// bgTertiary when not; PROVISIONAL (#194): light bgTertiary is the
// page's white, so the off track shows only through the thumb's hairline.
// The thumb is the onColor role (--primary-foreground) with a bgLine hairline.
// Disabled fades to half with its label (peer-disabled), as CDS does. Radix
// sets data-state, which radix-nova's data-checked: classes never match.
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-8 w-13 shrink-0 items-center rounded-full bg-(--color-bgTertiary) p-px transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        "data-[state=checked]:bg-primary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-7.5 rounded-full border-[0.5px] border-border bg-primary-foreground transition-transform data-[state=checked]:translate-x-5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
