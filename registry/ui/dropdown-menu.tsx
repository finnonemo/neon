import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Menu at iOS=False (core/components/menu.md): a 238px surface on Layer/layer-01 with
// 12px corners and no stroke, padded 10 above and below, its rows set 16px in. A row is at least
// 48px tall, a pill padded 8 at its right and 6 at its left, its Body label Text/text-primary
// and an icon in a 28px column 8px before it. A pointer fills the pill Layer/layer-hover-01 and
// a press Layer/layer-active-01; keyboard focus is a 2px Focus/focus stroke centered on the pill,
// with no fill (a row the keyboard reached under a resting pointer shows the fill instead). A destructive item is Core's Danger (Text/text-negative); a disabled one takes
// Text/text-disabled, with no opacity. The label is Core's Section Title (Footnote in
// Text/text-secondary, 32px tall) and the separator a 1px Border/border-subtle line, each 8px
// inside the rows' sides. Core's checkmark, subtitle, submenu, profile item and quick actions
// have no part here. Core draws the menu over its trigger from the anchored corner; Radix places
// it 8px off the trigger's side instead. The snapshot has no Elevation token, so the shadow is Neon's.
function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--radix-dropdown-menu-content-available-height) w-[238px] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover py-2.5 text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: "default" | "destructive" }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        "relative mx-4 flex min-h-12 cursor-default items-center gap-2 rounded-full py-3 pr-2 pl-1.5 text-body text-foreground outline-2 -outline-offset-1 outline-transparent transition-colors select-none",
        // Radix highlights a row for a pointer and for the keyboard alike, and :focus-visible holds for
        // both (it focuses the menu from script). So the pointer's fill is drawn where the row is
        // hovered and the keyboard's stroke where it is not.
        "data-[highlighted]:not-hover:outline-ring data-[highlighted]:hover:bg-layer-hover data-[highlighted]:active:bg-layer-active",
        "data-[disabled]:pointer-events-none data-[disabled]:text-disabled-foreground data-[variant=destructive]:text-negative",
        "[&_svg]:pointer-events-none [&_svg]:mx-1 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn("mx-4 px-2 pt-1 pb-2 text-caption text-muted-foreground", className)} {...props} />
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("mx-6 my-2.5 h-px bg-border", className)} {...props} />
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger }
