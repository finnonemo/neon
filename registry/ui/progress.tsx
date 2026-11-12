import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Progress bar, the bar alone: a square-ended Layer/layer-03 Track and the Indicator in
// it. size is Core's Size: sm, default and lg are Small, Medium and Large, 2, 4 and 8px tall.
// status is Core's Status: the Indicator is Support/support-info while active,
// Support/support-success on success and Support/support-error on error. The Indicator is
// track-wide and slides in from the left. value runs 0–100; with no value the bar is Core's
// Indeterminate, a Segment 72% of the Track wide that fades out at both ends. Radix exposes
// value as aria-valuenow, so give the bar a name with aria-label or aria-labelledby. Core's
// Label, Value and Helper text are the screen's own text.
function Progress({
  className,
  value,
  size = "default",
  status = "active",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
  status?: "active" | "success" | "error"
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-size={size}
      data-status={status}
      value={value}
      className={cn(
        "group/progress relative flex h-1 w-full items-center overflow-x-hidden bg-track data-[size=lg]:h-2 data-[size=sm]:h-0.5",
        className
      )}
      {...props}
    >
      {value == null ? (
        <span
          data-slot="progress-segment"
          className="absolute inset-y-0 left-[14%] w-[72%] bg-linear-to-r from-transparent via-info to-transparent"
        />
      ) : (
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="size-full flex-1 bg-info transition-all group-data-[status=error]/progress:bg-invalid group-data-[status=success]/progress:bg-success"
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      )}
    </ProgressPrimitive.Root>
  )
}

export { Progress }
