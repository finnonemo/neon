import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// The CDS RadioGroup: options 16px apart, each a 20px ring on the page's
// background. The ring is the --input role (bgLineHeavy, PROVISIONAL #134)
// and turns primary when checked, round a primary dot two thirds its size.
// Disabled fades to half with its label (peer-disabled), as CDS does. Radix
// sets data-state, which radix-nova's data-checked: classes never match.
// PROVISIONAL (#134): keyboard focus shows the Neon controls' 3px ring/50
// ring, not CDS's 2px bgPrimary outline 2px out; the checkbox, input and
// button share it, so it changes with them.
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-4", className)} {...props} />
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background text-primary transition-[border-color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive",
        "data-[state=checked]:border-primary",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="size-[13.33px] shrink-0 rounded-full bg-current" />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
