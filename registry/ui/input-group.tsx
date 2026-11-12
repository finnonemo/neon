import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Core's Text field with something beside its text: the group draws Input's 56px Field
// (Field/field, 8px corners, no stroke at rest) and holds a bare control. The Field's padding and
// the space between its parts are 16px. A unit or other text is body in Text/text-secondary; an
// icon is 20px in Icon/icon-primary. The group shows the control's state as Input does: Focus,
// invalid (focus shows over it), read-only and Disabled, whose text and icons take Core's disabled
// tokens with no opacity. Core's Text field has no icon before the text and no action
// inside the Field (those are its Search field and Password field): a start icon sits 16px from
// the Field's edge and from the text, and an end icon button keeps its own box inside the Field's
// padding. An addon above or below the control (block-start, block-end) has no value in Core.
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-14 w-full min-w-0 items-center rounded-md bg-field transition-[background-color,outline-color] hover:bg-field-hover",
        "has-[[data-slot=input-group-control]:focus-visible]:outline-3 has-[[data-slot=input-group-control]:focus-visible]:-outline-offset-3 has-[[data-slot=input-group-control]:focus-visible]:outline-ring",
        "has-[[data-slot=input-group-control][aria-invalid=true]:enabled]:bg-background has-[[data-slot=input-group-control][aria-invalid=true]:enabled]:outline-3 has-[[data-slot=input-group-control][aria-invalid=true]:enabled]:-outline-offset-3 has-[[data-slot=input-group-control][aria-invalid=true]:enabled]:outline-invalid has-[[data-slot=input-group-control][aria-invalid=true]:enabled:focus-visible]:outline-ring",
        "has-[[data-slot=input-group-control][readonly]:enabled]:bg-background has-[[data-slot=input-group-control][readonly]:enabled]:outline-2 has-[[data-slot=input-group-control][readonly]:enabled]:-outline-offset-2 has-[[data-slot=input-group-control][readonly]:enabled]:outline-border has-[[data-slot=input-group-control][readonly]:enabled:focus-visible]:outline-3 has-[[data-slot=input-group-control][readonly]:enabled:focus-visible]:-outline-offset-3 has-[[data-slot=input-group-control][readonly]:enabled:focus-visible]:outline-ring",
        "has-[[data-slot=input-group-control]:disabled]:bg-field-disabled",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto",
        "has-[>[data-align=block-end]]:[&>input]:pb-2 has-[>[data-align=block-start]]:[&>input]:pt-2",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 text-body text-muted-foreground select-none group-has-[[data-slot=input-group-control]:disabled]/input-group:text-disabled-foreground [&>svg]:text-icon group-has-[[data-slot=input-group-control]:disabled]/input-group:[&>svg]:text-icon-disabled [&>svg:not([class*='size-'])]:size-5",
  {
    variants: {
      align: {
        "inline-start": "order-first ps-4 has-[>button]:ps-1",
        "inline-end": "order-last pe-4 has-[>button]:ps-2 has-[>button]:pe-1",
        "block-start": "order-first w-full justify-start px-4 pt-3",
        "block-end": "order-last w-full justify-start px-4 pb-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector<HTMLElement>("input, textarea")?.focus()
      }}
      {...props}
    />
  )
}

// Neon Button's own sizes: "icon" is CDS's 40px IconButton, "sm" Core's Small, a 36px text button.
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={cn("[&_svg:not([class*='size-'])]:size-4", variant === "ghost" && "text-(--color-fgPrimary)", className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-body [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

// The control is bare: its group draws the field and shows its state.
const control =
  "min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-placeholder disabled:text-disabled-foreground disabled:placeholder:text-disabled-foreground"

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input-group-control" className={cn(control, "p-4", className)} {...props} />
}

function InputGroupTextarea({ className, rows = 3, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      rows={rows}
      className={cn(control, "min-h-26 w-full resize-none p-4", className)}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
