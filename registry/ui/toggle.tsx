import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// A Supporting item (ADR 0008): shaped for toggle-group, whose Counterpart is
// CDS's grouped toggle buttons, a ButtonGroup of CDS Buttons. CDS has no
// toggle button, so a toggle is a CDS Button whose variant follows its state.
// PROVISIONAL (#200): pressed is the inverse Button (bgInverse,
// fgInverse), as segmented-control's chosen segment is; unpressed is the
// secondary Button (bgSecondary, fg). PROVISIONAL (#201): sm, default
// and lg are the CDS Button sizes xs, s and m: 16px sides, then 6px and
// label1, 8px and headline, and 24px sides, 12px and headline. Every size is
// a pill. Disabled blends the fill into the page and halves the opacity, as a
// CDS Button does. Radix sets data-state=on|off; radix-nova's aria-pressed:
// classes miss a toggle-group's single mode, which sets aria-checked instead.
// PROVISIONAL (#134): keyboard focus shows the Neon controls' 3px ring/50
// ring, not CDS's 2px bgPrimary outline.
const toggleVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap transition-[color,background-color,box-shadow] outline-none",
  {
    variants: {
      size: {
        sm: "px-4 py-1.5 text-label1 [&_svg:not([class*='size-'])]:size-4",
        default: "px-4 py-2 text-headline [&_svg:not([class*='size-'])]:size-4",
        lg: "px-6 py-3 text-headline [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

// CDS paints [aria-pressed=true] with its press blend, so a pressed toggle is
// the inverse fill 95.7% into the page, and 93.7% when disabled, in light and
// dark alike. CDS also fades a pressed button's text to 82%; the text here is
// a bare text node, so it stays at full strength.
const toggleStates =
  "bg-secondary text-secondary-foreground hover:bg-accent disabled:bg-secondary-disabled data-[state=on]:bg-[color-mix(in_srgb,var(--color-bgInverse)_95.7%,var(--background))] data-[state=on]:text-inverse-foreground data-[state=on]:hover:bg-inverse/90 data-[state=on]:disabled:bg-[color-mix(in_srgb,var(--color-bgInverse)_93.7%,var(--background))] focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"

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
