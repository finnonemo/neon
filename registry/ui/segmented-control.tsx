import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// The CDS SegmentedTabs look on a radio group: one choice of a few, chosen
// with arrow keys. Tabs would claim tab panels a filter does not have.
function SegmentedControl({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="segmented-control"
      orientation="horizontal"
      className={cn("inline-flex h-[38px] w-fit items-center rounded-full bg-secondary", className)}
      {...props}
    />
  )
}

function SegmentedControlItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex h-full items-center justify-center rounded-full px-4 text-headline whitespace-nowrap text-foreground transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        "data-[state=checked]:bg-inverse data-[state=checked]:text-inverse-foreground",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
