import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Select at Large: Input's 56px field with the value in body type (the placeholder ink
// while it shows the placeholder) and a chevron in Icon/icon-primary. Keyboard focus is Core's
// Focus, 3px in Focus/focus inside the field; open is Core's Active, the page background in a
// 3px Border/border-strong stroke with the chevron turned up. Invalid and Disabled are Input's.
// PROVISIONAL (#210): the listbox keeps the CDS look, the elevated fill with 16px corners and
// 60px headline options, until the menu is retuned. Picking an option closes it, as in Radix.
function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group/select-trigger flex h-14 w-full min-w-0 items-center justify-between gap-4 rounded-md bg-field px-4 text-left text-body text-foreground transition-[background-color,outline-color] select-none hover:bg-field-hover data-[placeholder]:text-placeholder",
        "focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring",
        "aria-invalid:bg-background aria-invalid:outline-3 aria-invalid:-outline-offset-3 aria-invalid:outline-invalid aria-invalid:hover:bg-background aria-invalid:focus-visible:outline-ring",
        "data-[state=open]:bg-background data-[state=open]:outline-3 data-[state=open]:-outline-offset-3 data-[state=open]:outline-line-strong data-[state=open]:hover:bg-background data-[state=open]:aria-invalid:outline-line-strong",
        "disabled:pointer-events-none disabled:bg-field-disabled disabled:text-disabled-foreground disabled:aria-invalid:bg-field-disabled disabled:aria-invalid:outline-0 disabled:data-[placeholder]:text-disabled-foreground",
        "*:data-[slot=select-value]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-5 text-icon transition-transform group-disabled/select-trigger:text-icon-disabled group-data-[state=open]/select-trigger:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({ className, children, position = "popper", sideOffset = 8, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-popover py-2 text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label data-slot="select-label" className={cn("px-6 py-2 text-label2 text-muted-foreground", className)} {...props} />
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-15 w-full cursor-default items-center gap-4 px-6 py-2 text-headline text-foreground outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto">
        <CheckIcon className="size-5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("my-2 h-px bg-border", className)} {...props} />
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }
