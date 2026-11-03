import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// The CDS Tabs underline look for page-level sections with their own panels:
// tabs 32px apart, each a headline label with 16px above and below and no side
// padding. The active label takes the fgPrimary role (read from theme.css,
// since shadcn has no slot for it) over a 2px primary underline the tab's
// width; the others stay fg. Disabled fades to half, as CDS does. Radix sets
// data-state, which radix-nova's data-active: classes never match.
// PROVISIONAL (#202): in dark the active tab shows almost only by
// that underline, bgPrimary at 2.57:1 on the page; its label is 1.23:1 from
// the others. PROVISIONAL (#134): keyboard focus shows the Neon controls' 3px
// ring/50 ring, not CDS's 2px bgPrimary outline inset.
// Radix selects a tab as arrow keys reach it; CDS only moves focus.
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("relative inline-flex w-fit items-center gap-8", className)} {...props} />
}

function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group/tabs-trigger relative inline-flex items-center justify-center gap-1.5 border border-transparent py-4 text-headline whitespace-nowrap text-foreground transition-colors outline-none disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "data-[state=active]:text-(--color-fgPrimary)",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden
        data-slot="tabs-indicator"
        className="pointer-events-none absolute -inset-x-px -bottom-px hidden h-0.5 bg-primary group-data-[state=active]/tabs-trigger:block"
      />
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
