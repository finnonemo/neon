import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Segmented control on a radio group: one choice of a few, chosen with arrow keys. Tabs
// would claim tab panels a filter does not have. The track has 12px corners and no fill (Core's
// Floating=False, the control in the page) and fills its container; its segments share the width equally. size is Core's Size:
// sm, default and lg are Small, Medium and Large, a 36, 48 and 56px track round 28, 36 and 48px
// segments. A segment has 8px corners and a 2px stroke inside it at every state: no paint and
// Text/text-secondary when not chosen (Hover and Pressed fill it with layer-hover-01 and
// layer-active-01), Button/button-secondary and Text/text-primary with no stroke when chosen
// (Hover and Focus button-secondary-hover, Pressed button-secondary-active), Focus/focus on
// keyboard focus. A disabled segment takes Text/text-disabled, and Button/button-disabled when
// chosen; a disabled control is half opacity over segments that keep their Enabled look.
function SegmentedControl({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & { size?: "sm" | "default" | "lg" }) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="segmented-control"
      data-size={size}
      orientation="horizontal"
      className={cn(
        "group/segmented-control grid min-h-12 w-full auto-cols-fr grid-flow-col items-center rounded-lg p-1.5 data-[disabled]:opacity-50 data-[size=lg]:min-h-14 data-[size=lg]:p-1 data-[size=sm]:min-h-9 data-[size=sm]:p-1",
        className
      )}
      {...props}
    />
  )
}

function SegmentedControlItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex h-9 min-w-0 items-center justify-center rounded-md px-2 text-label2 whitespace-nowrap text-muted-foreground outline-2 -outline-offset-2 outline-transparent transition-[color,background-color,outline-color] hover:bg-layer-hover active:bg-layer-active active:text-foreground",
        "group-data-[size=lg]/segmented-control:h-12 group-data-[size=lg]/segmented-control:text-body group-data-[size=sm]/segmented-control:h-7 group-data-[size=sm]/segmented-control:px-0.5",
        "data-[state=checked]:bg-button-secondary data-[state=checked]:text-foreground data-[state=checked]:hover:bg-button-secondary-hover data-[state=checked]:focus-visible:bg-button-secondary-hover data-[state=checked]:active:bg-button-secondary-active",
        "focus-visible:outline-ring data-[state=checked]:focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:text-disabled-foreground data-[state=checked]:disabled:bg-button-disabled data-[state=checked]:disabled:text-disabled-foreground",
        "group-data-[disabled]/segmented-control:disabled:text-muted-foreground group-data-[disabled]/segmented-control:data-[state=checked]:disabled:bg-button-secondary group-data-[disabled]/segmented-control:data-[state=checked]:disabled:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
