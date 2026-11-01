import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// The CDS ListCell: 64px rows, 16px apart, 8px corners, a selected row on the
// secondary fill with a check. Rows are buttons in a list; the selected one
// carries aria-current.
function List({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="list" className={cn("flex flex-col gap-4 py-2", className)} {...props} />
}

function ListRow({
  className,
  selected = false,
  children,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <li className="flex">
      <button
        type="button"
        data-slot="list-row"
        aria-current={selected || undefined}
        className={cn(
          "flex min-h-16 w-full items-center gap-4 rounded-md px-4 py-2 text-left text-body text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=true]:bg-secondary",
          className
        )}
        {...props}
      >
        {children}
        {selected && <CheckIcon data-slot="list-row-check" className="size-4 shrink-0" aria-hidden />}
      </button>
    </li>
  )
}

function ListRowContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="list-row-content" className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />
}

function ListRowTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="list-row-title" className={cn("truncate text-headline", className)} {...props} />
}

function ListRowDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="list-row-description" className={cn("truncate text-body text-muted-foreground", className)} {...props} />
}

export { List, ListRow, ListRowContent, ListRowTitle, ListRowDescription }
