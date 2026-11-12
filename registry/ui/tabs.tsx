import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Tabs (core/components/tabs.md), Style=Underline with tabs as wide as their labels: the
// bar fills its container over a 1px Track in Border/border-subtle, and the tabs touch. A tab is
// at least 48px each way, padded 12 and 16, its label Subheadline in Text/text-secondary. The
// selected tab's label is Text/text-primary over a 2px Line in Border/border-strong, which draws
// over the Track. Active fills the tab Layer/layer-active-01, Disabled takes Text/text-disabled
// with no opacity, and a disabled selected tab's Line is Border/border-disabled. Keyboard focus is
// Core's 2px Focus/focus stroke inside the tab, drawn as an inset ring so the Line shows over its
// bottom edge. Core has no Hover for a tab. Core's Pill style and equal-width tabs have no prop.
// Radix sets data-state, which radix-nova's data-active: classes never match, and selects a tab
// as arrow keys reach it.
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />
}

function TabsList({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List data-slot="tabs-list" className={cn("relative flex w-full items-center", className)} {...props}>
      <span aria-hidden data-slot="tabs-track" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border" />
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group/tabs-trigger relative inline-flex min-h-12 min-w-12 items-center justify-center gap-2 px-4 py-3 text-label2 whitespace-nowrap text-muted-foreground inset-ring-2 inset-ring-transparent transition-[color,background-color,box-shadow] outline-none",
        "focus-visible:inset-ring-ring active:bg-layer-active data-[state=active]:text-foreground",
        "disabled:pointer-events-none disabled:text-disabled-foreground disabled:data-[state=active]:text-disabled-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden
        data-slot="tabs-indicator"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-0.5 bg-line-strong group-disabled/tabs-trigger:bg-line-disabled group-data-[state=active]/tabs-trigger:block"
      />
    </TabsPrimitive.Trigger>
  )
}

// A panel takes keyboard focus when it holds nothing focusable: Core's Focus/focus, 2px, 2px outside.
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
