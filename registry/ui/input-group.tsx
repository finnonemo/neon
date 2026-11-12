import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// CDS TextInput's start and end slots: the group draws Input's 56px field (8px
// corners, the heavy line role) and the control inside it drops its own
// border. A start icon sits in 16px either side, as CDS InputIcon, and the
// input then keeps only 4px of start padding. An end suffix is label1 in the
// muted role with 16px after it; an end icon button is CDS's transparent
// InputIconButton, 8px before and 4px after, in the fgPrimary role (read from
// theme.css, since shadcn has no slot for it). The focus ring is Input's.
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-14 w-full min-w-0 items-center rounded-md border border-input bg-background transition-[border-color,box-shadow] outline-none has-disabled:opacity-50",
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto",
        "has-[>[data-align=inline-start]]:[&>input]:ps-1 has-[>[data-align=block-end]]:[&>input]:pb-2 has-[>[data-align=block-start]]:[&>input]:pt-2",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 text-label1 text-muted-foreground select-none [&>svg]:text-foreground [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first px-4 has-[>button]:ps-1 has-[>button]:pe-2",
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
        "flex items-center gap-2 text-label1 text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-auto flex-1 rounded-none border-0 bg-transparent ring-0 focus-visible:ring-0 disabled:opacity-100 aria-invalid:ring-0",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent ring-0 focus-visible:ring-0 disabled:opacity-100 aria-invalid:ring-0",
        className
      )}
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
