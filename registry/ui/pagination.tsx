import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Core's Pagination (core/components/pagination.md), Type=Numbered at Medium: a bar at least
// 56px tall on Layer/layer-01 under a Border/border-subtle top line, padded 16 at its sides, with
// Previous and Next 16px from the pages. A page is a 36px box with 8px corners inside a 48px
// target, its number Text/text-primary: Hover fills it Layer/layer-hover-01 and Pressed
// Layer/layer-active-01. The current page is Background/background-inverse with
// Text/text-inverse, marked aria-current="page". Disabled takes Text/text-disabled with no
// opacity. Keyboard focus is Core's 2px Focus/focus ring round the box, inside the target.
// Core's Previous and Next are its Icon button (Tertiary, 48px), which the registry has no item
// for: they stay the Button's 40px ghost icon size. Core's page number is Callout, Strong when
// selected, which no type role holds: it stays Headline. Core's Overflow type and Small size
// have no prop.
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex min-h-14 w-full items-center justify-center border-t border-border bg-card px-4", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex min-w-0 items-center", className)} {...props} />
}

// Core's 48px target round each control. Core's five pages with Previous and Next are wider than
// a 375px screen, so in a bar too narrow for them the targets close up to their 36px boxes
// rather than run off its sides.
function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn("flex min-h-12 min-w-fit shrink basis-12 items-center justify-center", className)} {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  /**
   * Drops the href and onClick and marks the link aria-disabled, as Previous
   * is on the first page. pointer-events: none stops only the
   * mouse; a screen reader still sends a click, so onClick must go too.
   */
  disabled?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

// A page number is Core's page item. Core's page has one box, so a page number given a size
// keeps the ghost Button in that size, as any other content (Previous, Next) is, in the icon
// size by default. A disabled link is not :disabled, so it takes the ghost Button's disabled
// look by aria-disabled: no fill at an icon size, as Core's Icon button, Tertiary. The fill is
// named there, so a link that turns disabled while it holds keyboard focus drops the Focus fill.
function PaginationLink({ className, isActive, disabled, size, href, onClick, children, ...props }: PaginationLinkProps) {
  const isPage = size === undefined && (typeof children === "string" || typeof children === "number")
  const link = (
    <a
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      role={disabled ? "link" : undefined}
      href={disabled ? undefined : href}
      onClick={disabled ? undefined : onClick}
      data-slot="pagination-link"
      data-active={isActive}
      {...(isPage && {
        className: cn(
          "relative inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-headline whitespace-nowrap text-foreground outline-2 outline-offset-0 outline-transparent transition-colors after:absolute after:-inset-1.5",
          "hover:bg-layer-hover focus-visible:outline-ring active:bg-layer-active",
          "aria-[current=page]:bg-inverse aria-[current=page]:text-inverse-foreground aria-[current=page]:hover:bg-inverse aria-[current=page]:active:bg-inverse",
          "aria-disabled:pointer-events-none aria-disabled:bg-transparent aria-disabled:text-disabled-foreground aria-disabled:aria-[current=page]:bg-layer-active aria-disabled:aria-[current=page]:text-disabled-foreground",
          className
        ),
      })}
      {...props}
    >
      {children}
    </a>
  )
  if (isPage) return link
  const buttonSize = size ?? "icon"
  return (
    <Button
      asChild
      variant="ghost"
      size={buttonSize}
      className={cn(
        "aria-disabled:pointer-events-none",
        buttonSize === "icon" || buttonSize === "icon-sm"
          ? "aria-disabled:bg-transparent aria-disabled:text-icon-disabled"
          : "aria-disabled:bg-button-disabled aria-disabled:text-button-disabled-foreground",
        className
      )}
    >
      {link}
    </Button>
  )
}

// Previous and Next are 40px icon buttons with a 16px icon and no visible text, 16px from
// the pages; text is their accessible name.
function PaginationPrevious({
  className,
  text = "Previous page",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink className={cn("me-4 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
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
    <PaginationLink className={cn("ms-4 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      <ChevronRightIcon />
      <span className="sr-only">{text}</span>
    </PaginationLink>
  )
}

// Core's Ellipsis item is Text/text-primary: "..." in headline type, hidden from screen readers.
// Core's opens a Menu of the hidden pages; this one is not a control.
function PaginationEllipsis({ className, children = "...", ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("block min-w-9 text-center text-headline whitespace-nowrap text-foreground", className)}
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
