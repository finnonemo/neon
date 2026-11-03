import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// The CDS ButtonGroup: a row as wide as its container holding Neon Buttons
// kept whole, each its own pill, 8px apart. CDS never joins them, so
// radix-nova's squared inner corners and dropped borders are gone, as in
// toggle-group. Horizontal keeps each button's own width and does not wrap;
// vertical stretches every button to the group's width, as CDS's block
// buttons do. A nested group is one more item 8px away.
const buttonGroupVariants = cva("group/button-group flex flex-nowrap gap-2 *:focus-visible:relative *:focus-visible:z-10 [&>input]:flex-1", {
  variants: {
    orientation: {
      horizontal: "flex-row items-stretch",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
})

function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

// PROVISIONAL (#208): CDS ButtonGroup holds buttons only. This text segment is
// a pill as tall as its row, label1 in the secondary button's roles.
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="button-group-text"
      className={cn(
        "flex items-center gap-2 rounded-full bg-secondary px-4 text-label1 text-secondary-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

// PROVISIONAL (#208): CDS ButtonGroup has no divider. This is the Neon
// separator (CDS Divider, bgLine), vertical by default, in the 8px gap.
function ButtonGroupSeparator({ orientation = "vertical", ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="button-group-separator" orientation={orientation} {...props} />
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
