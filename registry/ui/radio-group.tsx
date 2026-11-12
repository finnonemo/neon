import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Radio (Type=Inset): each radio is a 24px Box that paints nothing and holds the glyph,
// 17px in Icon/icon-primary. The glyph is the whole indicator and is always there, so choosing
// moves nothing: a thin ring when not chosen, a thick ring round a hole when chosen (Core's
// circle and circle-dot, drawn in CSS at their proportions). Disabled takes Icon/icon-disabled
// with no opacity, and a Label beside the radio follows it (peer-disabled). Keyboard focus is
// Core's round Focus ring, Focus/focus 2px wide, its outer edge 4px out from the Box. Core has
// no invalid radio: aria-invalid draws the glyph in the invalid role. Core's Radio is one
// option and gives no gap between options: they stay 16px apart.
// Radix sets data-state, which radix-nova's data-checked: classes never match.
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-4", className)} {...props} />
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer flex size-6 shrink-0 items-center justify-center rounded-full text-icon transition-[color,outline-color] aria-invalid:text-invalid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:text-icon-disabled disabled:aria-invalid:text-icon-disabled",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        forceMount
        data-slot="radio-group-indicator"
        className="block size-[17px] shrink-0 rounded-full border-[1.6px] border-current transition-[border-width] data-[state=checked]:border-[5.3px]"
      />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
