import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Core's In-line banner (core/components/banner.md), Hierarchy=Primary: a box at least 80px tall
// with 16px corners and 16px padding on its Status's Notifications fill, its text in
// Text/text-primary and its icon in Icon/icon-primary whatever the Status. The icon is Core's
// Large glyph, drawn 20px in a 24px box as the Button's is, 16px before the text; the label1 Title sits on the label2 Description
// with no gap. Each variant is a Status:
//   informational  Info     Notifications/notification-info-background
//   success        Success  Notifications/notification-success-background
//   warning        Warning  Notifications/notification-warning-background
//   error          Error    Notifications/notification-error-background
// promotional has no Status in Core: it keeps its brand wash (PROVISIONAL: no Core token) and is not chosen for new work.
// Core's border is the fill's own color in light and clear in dark, so none is drawn. Core's
// Secondary hierarchy, Caution statuses, Badge artwork and its Button and Toggle actions have no
// prop. AlertAction sits top right; Core's Icon Button action is the row's last item.
//
// Announced politely: the alert is a polite, atomic status region (never
// role=alert, which interrupts). Its content stays aria-hidden until the frame
// after the region is first painted, so the region is in the accessibility
// tree before its text and screen readers announce an alert that appears.
const alertVariants = cva(
  "relative flex min-h-20 w-full items-center rounded-xl p-4 text-left text-label2 text-foreground has-data-[slot=alert-action]:pr-14",
  {
    variants: {
      variant: {
        informational: "bg-info-wash",
        success: "bg-positive-wash",
        warning: "bg-warning-wash",
        error: "bg-negative-wash",
        promotional: "bg-(--color-bgPrimaryWash)",
      },
    },
    defaultVariants: {
      variant: "informational",
    },
  }
)

/** False until two frames after mount: the first paints the empty live region. */
function useSettled() {
  const [settled, setSettled] = React.useState(false)
  React.useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setSettled(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [])
  return settled
}

function Alert({
  className,
  variant = "informational",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const settled = useSettled()
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div
        data-slot="alert-content"
        aria-hidden={settled ? undefined : true}
        className="group/alert grid min-w-0 flex-1 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-4 *:[svg]:row-span-2 *:[svg]:my-0.5 *:[svg:not([class*='size-'])]:size-5"
      >
        {children}
      </div>
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-label1 group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-label2 group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-3 right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
