import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Core's Accordion (core/components/accordion.md) at Medium: each header is a row with 12px
// corners on Layer/layer-01, 8px in from the item's sides and padded 8 at its own, so the title
// starts 16 in. The title is Headline in Text/text-primary with 14px above and below, 56px for
// one line, and wraps. The chevron sits 8px after it in a 24px box, Icon/icon-secondary, down
// when closed and up when open. Active fills the row Layer/layer-active-01, keyboard focus turns
// its 2px inner stroke Focus/focus, and Disabled takes Text/text-disabled and Icon/icon-disabled
// with no opacity. Core has no Hover for a header: Neon uses Layer/layer-hover-01, as on a list
// row. Items are split by Core's Bottom border, 1px Border/border-subtle, none after the last.
// The panel is Core's Content Slot, which gives no padding: it keeps 16px under its header with
// 24px at the sides and below. Radix sets data-state, which radix-nova's data-open: classes
// never match.
function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn("flex w-full flex-col", className)} {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-border not-last:border-b", className)} {...props} />
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex px-2">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex min-h-14 flex-1 items-center gap-2 rounded-lg bg-card px-2 py-3.5 text-start text-headline text-foreground outline-2 -outline-offset-2 outline-transparent transition-colors",
          "hover:bg-layer-hover focus-visible:outline-ring active:bg-layer-active disabled:pointer-events-none disabled:text-disabled-foreground",
          className
        )}
        {...props}
      >
        <span data-slot="accordion-trigger-title" className="flex-1">
          {children}
        </span>
        <ChevronDownIcon
          aria-hidden
          data-slot="accordion-trigger-icon"
          className="pointer-events-none size-6 shrink-0 text-icon-muted transition-transform group-disabled/accordion-trigger:text-icon-disabled group-data-[state=open]/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("px-6 pt-4 pb-6 [&_a]:underline [&_a]:underline-offset-3", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
