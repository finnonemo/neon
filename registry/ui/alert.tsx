import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// alert → CDS Banner, contextual style (Counterpart; cds-web 9.26.1
// banner/Banner.js and cds-common tokens/banner.js): a 16px-radius box with
// 16px padding and no border; a 16px icon in a 24px column (4px each side, 2px
// down), 8px before the label1 title and the label2 message, 4px apart, both
// in fg. Each variant takes CDS's banner fill and icon color:
//   informational  bgSecondary     fgPrimary
//   warning        bgWarningWash   fgWarning
//   error          bgNegativeWash  fgNegative
//   promotional    bgPrimaryWash   fgPrimary
// Not matched: CDS clamps the title to 2 lines and the message to 3 and sets a
// 320px minimum width; Neon wraps the whole text and takes its container's width.
// PROVISIONAL (#203): fgWarning on bgWarningWash is 2.998:1 in light, under
// the 3:1 non-text minimum, for the warning icon.
// PROVISIONAL (#204): informational and promotional differ only in fill, and
// those are nearly the same: Grey/5 and Navy/5 in light (1.01:1), Grey/90 and
// Navy/100 in dark (1.04:1).
// PROVISIONAL (#205): AlertAction has no measured Counterpart; it sits top
// right, where CDS puts a Banner's dismiss button.
//
// Announced politely: the alert is a polite, atomic status region (never
// role=alert, which interrupts). Its content stays aria-hidden until the frame
// after the region is first painted, so the region is in the accessibility
// tree before its text and screen readers announce an alert that appears.
// CDS Banner has no live region.
const alertVariants = cva(
  "relative w-full rounded-xl p-4 text-left text-label2 text-foreground has-data-[slot=alert-action]:pr-14",
  {
    variants: {
      variant: {
        informational: "bg-secondary [--alert-icon:var(--color-fgPrimary)]",
        warning: "bg-warning-wash [--alert-icon:var(--color-fgWarning)]",
        error: "bg-negative-wash [--alert-icon:var(--color-fgNegative)]",
        promotional: "bg-(--color-bgPrimaryWash) [--alert-icon:var(--color-fgPrimary)]",
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
        className="group/alert grid gap-y-1 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:mx-1 *:[svg]:mt-0.5 *:[svg]:text-[color:var(--alert-icon,currentColor)] *:[svg:not([class*='size-'])]:size-4"
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
