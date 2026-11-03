import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// The CDS Accordion: each header at least 82px, a headline title with 8px
// above and below and 24px either side, and a 16px muted caret 16px after it
// that points down when closed and up when open. The panel sits 16px under
// its header with 24px at the sides and below. Items are split by a 1px
// bgLine border, none after the last. Radix sets data-state, which
// radix-nova's data-open: classes never match.
// PROVISIONAL (#134): keyboard focus shows the Neon controls' 3px ring/50
// ring, not CDS's 2px bgPrimary outline inset.
function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn("flex w-full flex-col", className)} {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-border not-last:border-b", className)} {...props} />
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex min-h-[82px] flex-1 items-center gap-4 border border-transparent px-6 py-2 text-start text-headline text-foreground transition-colors outline-none disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50",
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
          className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/accordion-trigger:rotate-180"
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
