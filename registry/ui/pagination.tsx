import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The CDS Pagination: a centered row of Neon Buttons 4px apart. The current
// page is the primary button and marked aria-current="page"; every other
// control is the ghost button, transparent on the page. PROVISIONAL (#209):
// in dark the current page's bgPrimary fill is 2.57:1 on the page. Focus
// shows the Neon Button's ring (PROVISIONAL (#134)).
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex items-center gap-1", className)} {...props} />
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  /**
   * Drops the href and onClick and marks the link aria-disabled, as CDS
   * disables previous on the first page. pointer-events: none stops only the
   * mouse; a screen reader still sends a click, so onClick must go too.
   */
  disabled?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

// CDS sizes a page button by its number: one digit is a 40px circle, more is a
// pill padded 16px by 8px (38px tall). Headline type, from the Button.
function PaginationLink({ className, isActive, disabled, size = "icon", href, onClick, children, ...props }: PaginationLinkProps) {
  const number = typeof children === "string" || typeof children === "number" ? String(children) : null
  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      size={size}
      className={cn(
        number !== null && "px-4 py-2",
        number !== null && number.length > 1 && "size-auto",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        className
      )}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        aria-disabled={disabled || undefined}
        role={disabled ? "link" : undefined}
        href={disabled ? undefined : href}
        onClick={disabled ? undefined : onClick}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      >
        {children}
      </a>
    </Button>
  )
}

// CDS's previous and next are 40px icon buttons with a 16px icon and no
// visible text; text is their accessible name.
function PaginationPrevious({
  className,
  text = "Previous page",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink className={cn("[&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <ChevronLeftIcon />
      <span className="sr-only">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next page",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink className={cn("[&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <ChevronRightIcon />
      <span className="sr-only">{text}</span>
    </PaginationLink>
  )
}

// CDS's ellipsis: "..." in headline type and the muted role, hidden from
// screen readers.
function PaginationEllipsis({ className, children = "...", ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("block text-headline whitespace-nowrap text-muted-foreground", className)}
      {...props}
    >
      {children}
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
