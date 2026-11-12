import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Core's List item at Medium. A row is Core's Main table cell: at least 48px tall, 12px corners,
// 8px padding and gaps, on Layer/layer-01, set 8px in from the list's sides, so its text starts
// 16px in. The text beside it is at least 56px with 14px above and below: one line is 56px, a
// title and a description 72px. Rows touch, with a 1px Divider under each but the last; the
// Divider hides while its row is pressed or has keyboard focus. Pressing fills the row
// Layer/layer-active-01, and keyboard focus turns the 2px stroke inside it Focus/focus. A
// disabled row takes Text/text-disabled. Core has no selected fill: the selected row shows
// Core's Checkmark in Link/link-primary and carries aria-current. Core has no Hover either; a
// pointer gets Layer/layer-hover-01.
function List({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="list" className={cn("flex flex-col", className)} {...props} />
}

function ListRow({
  className,
  selected = false,
  children,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <li className="group/list-row flex flex-col px-2">
      <button
        type="button"
        data-slot="list-row"
        aria-current={selected || undefined}
        className={cn(
          "flex min-h-12 w-full items-center gap-2 rounded-lg bg-card px-2 text-left text-body text-foreground outline-2 -outline-offset-2 outline-transparent transition-colors hover:bg-layer-hover focus-visible:outline-ring active:bg-layer-active disabled:pointer-events-none disabled:text-disabled-foreground",
          className
        )}
        {...props}
      >
        {children}
        {selected && <CheckIcon data-slot="list-row-check" className="size-6 shrink-0 text-link in-disabled:text-icon-disabled" aria-hidden />}
      </button>
      <span
        data-slot="list-row-divider"
        aria-hidden
        className="h-px bg-border group-last/list-row:hidden group-has-[button:active]/list-row:invisible group-has-[button:focus-visible]/list-row:invisible"
      />
    </li>
  )
}

function ListRowContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="list-row-content" className={cn("flex min-h-14 min-w-0 flex-1 flex-col justify-center py-3.5", className)} {...props} />
}

// Headline, in the row's text color.
function ListRowTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="list-row-title" className={cn("truncate text-headline", className)} {...props} />
}

// Footnote in Text/text-secondary; Text/text-disabled in a disabled row.
function ListRowDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="list-row-description"
      className={cn("truncate text-legal text-muted-foreground group-has-[button:disabled]/list-row:text-disabled-foreground", className)}
      {...props}
    />
  )
}

export { List, ListRow, ListRowContent, ListRowDescription, ListRowTitle }
