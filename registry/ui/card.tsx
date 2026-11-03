import * as React from "react"

import { cn } from "@/lib/utils"

// card → CDS ContentCard (Counterpart; CDS Card is deprecated in cds-web
// 9.26.1 in its favor): 24px radius, 16px padding and 16px between its parts.
// The header is ContentCardBody's text: a headline title over a label2
// description in fgMuted, with no gap; the content inherits body; the footer
// spreads its children like ContentCardFooter.
// Not matched: CDS clamps the title to 2 lines and the description to 3 and
// sets a 280–800px width range; Neon wraps the whole text and takes its
// container's width.
// PROVISIONAL (#206): ContentCard draws no surface; Neon's card takes the
// card slot, bgElevation1, with a bgLine hairline (CDS's bordered Box).
// PROVISIONAL (#207): size="sm" (12px padding and gaps) and CardAction have
// no Counterpart, and the footer drops shadcn's top border and fill.
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-(--borderRadius-500) border bg-card p-4 text-body text-card-foreground data-[size=sm]:gap-3 data-[size=sm]:p-3",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-action]:gap-x-2 has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-headline", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-label2 text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={className} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
