import * as React from "react"

import { cn } from "@/lib/utils"

// Core's List item at Medium. A row is Core's Main table cell: at least 48px tall, 12px corners,
// 8px padding and gaps, on Layer/layer-01, set 8px in from the list's sides, so its text starts
// 16px in. The text beside it is at least 56px with 14px above and below: one line is 56px, a
// title and a description 72px. Rows touch, with a 1px Divider under each but the last; the
// Divider hides while its row is pressed or has keyboard focus. Pressing fills the row
// Layer/layer-active-01, and keyboard focus turns the 2px stroke inside it Focus/focus. A
// disabled row takes Text/text-disabled. Core has no Hover; a pointer gets Layer/layer-hover-01.
//
// The selected row, the record a detail pane shows, keeps Core's Active fill as
// Layer/layer-selected-01 (the same Navy 8A, White 12A in dark) and carries aria-current; a
// disabled row keeps Layer/layer-01 whether selected or not. It
// shows no Checkmark: the owner's call, a deliberate step from Core's List item, which marks a
// selected row with a trailing Checkmark. A pick among options is a Radio or Checkbox, not a row.
//
// An action on the row's record (buy more, retry) is Core's Trailing Button: pass it as `action`
// and it sits inside the row, after the text, never beside the row. The row's fill then spans the
// action too; the action stays a button of its own, outside the row's button.
const rowFill = (selected: boolean) =>
  selected ? "bg-card enabled:bg-layer-selected" : "bg-card hover:bg-layer-hover active:bg-layer-active"

const rowButton =
  "flex min-h-12 w-full items-center gap-2 rounded-lg px-2 text-left text-body text-foreground outline-2 -outline-offset-2 outline-transparent transition-colors focus-visible:outline-ring disabled:pointer-events-none disabled:text-disabled-foreground"

function List({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="list" className={cn("flex flex-col", className)} {...props} />
}

function ListRow({
  className,
  selected = false,
  action,
  children,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean; action?: React.ReactNode }) {
  const button = (
    <button
      type="button"
      data-slot="list-row"
      aria-current={selected || undefined}
      className={cn(rowButton, action ? "min-w-0 flex-1 bg-transparent" : rowFill(selected), className)}
      {...props}
    >
      {children}
    </button>
  )
  return (
    <li className="group/list-row flex flex-col px-2">
      {action ? (
        <div
          data-slot="list-row-box"
          className={cn(
            "flex items-center gap-2 rounded-lg pe-2 transition-colors",
            selected
              ? "bg-layer-selected"
              : "bg-card has-[[data-slot=list-row]:hover]:bg-layer-hover has-[[data-slot=list-row]:active]:bg-layer-active"
          )}
        >
          {button}
          <div data-slot="list-row-action" className="flex shrink-0 items-center">
            {action}
          </div>
        </div>
      ) : (
        button
      )}
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
