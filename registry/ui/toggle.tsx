import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// A Supporting item (ADR 0008): shaped for toggle-group, whose Counterpart is Core's Selection
// tag. Core's default variant is White Primary, and its doc calls Secondary the usual choice for
// filters beside their content; a toggle is Secondary Navy until Core says which Color it takes. sm, default and lg are Core's Small, Medium and Large: 24, 32 and 40px
// tall, with 6px sides, 4px corners and 13/20 type, then 8px sides, 8px corners and 15/24, then
// the same at 17/24. The gap to an icon is 4, 8 and 12px. Radix sets data-state=on|off;
// radix-nova's aria-pressed: classes miss a toggle-group's single mode, which sets aria-checked.
const toggleVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[color,background-color,outline-color,box-shadow]",
  {
    variants: {
      size: {
        sm: "h-6 gap-1 rounded-sm px-1.5 py-0.5 text-legal [&_svg:not([class*='size-'])]:size-4",
        default: "h-8 gap-2 rounded-md px-2 py-1.5 text-label2 [&_svg:not([class*='size-'])]:size-4.5",
        lg: "h-10 gap-3 rounded-md px-2 py-2.5 text-body [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

// The tag's fill and ink with a ring inside it: 1px in the tag's border, and 2px in its ink when
// pressed, the one thing that tells pressed from not. Hover darkens the fill. Disabled takes
// Core's disabled tokens with no opacity, and its ring is its fill's color. Core's Selection tag
// has no Focus state: keyboard focus draws Focus/focus 2px wide round the tag, outside the ring,
// so a focused toggle still shows whether it is pressed.
const toggleStates =
  "bg-selection-tag text-selection-tag-foreground outline-1 -outline-offset-1 outline-selection-tag-border hover:bg-selection-tag-hover data-[state=on]:outline-2 data-[state=on]:-outline-offset-2 data-[state=on]:outline-selection-tag-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-selection-tag-disabled disabled:text-disabled-foreground disabled:outline-selection-tag-disabled data-[state=on]:disabled:outline-selection-tag-disabled [&_svg]:pointer-events-none [&_svg]:shrink-0"

function Toggle({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-size={size}
      className={cn(toggleVariants({ size }), toggleStates, className)}
      {...props}
    />
  )
}

export { Toggle, toggleStates, toggleVariants }
