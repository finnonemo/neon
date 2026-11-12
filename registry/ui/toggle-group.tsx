import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleStates, toggleVariants } from "@/components/ui/toggle"

// A group of Core's Selection tags (see toggle), 8px apart in a row, or stretched full width in a
// column. The tags are never joined, so radix-nova's spacing and outline variant are gone. Radix
// gives the keyboard model: one Tab stop, arrow keys move between items, Space or Enter presses.
// type="single" is a radio group (aria-checked), type="multiple" a toolbar of aria-pressed
// buttons. Radix sets data-orientation only when given one, so it is always passed.
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
})

function ToggleGroup({
  className,
  size,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-size={size}
      orientation={orientation}
      className={cn(
        "flex flex-row flex-nowrap items-stretch gap-2 data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  const resolved = context.size || size

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-size={resolved}
      className={cn(toggleVariants({ size: resolved }), toggleStates, className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
