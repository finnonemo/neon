import * as React from "react"

import { cn } from "@/lib/utils"

// Core's Table at Medium: rows at least 56px tall with a 1px Divider under each, cells padded
// 14px and 8px, a header row on Layer/layer-02 with Footnote Strong labels in
// Text/text-secondary over Body cells. Core's row pads 8px a side; a table row cannot, so the
// first and last cell carry it and their text sits 16px from the table's edge. A body row fills
// Layer/layer-hover-01 on hover and Layer/layer-selected-01 when selected. Text wraps. A cell
// that holds a button or an input pads 4px above and below, as Core's Button and Input cells. Core's
// Small and Large rows, Zebra and its expanded row have no value here; the footer and the
// caption are Neon's own.
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn("w-full caption-bottom text-body", className)} {...props} />
    </div>
  )
}

function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" {...props} />
}

function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("bg-muted", className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("border-b border-border transition-colors [tbody_&]:hover:bg-layer-hover data-[state=selected]:bg-layer-selected", className)} {...props} />
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th data-slot="table-head" className={cn("h-14 bg-layer-02 px-2 py-3.5 text-left align-middle text-caption text-muted-foreground first:pl-4 last:pr-4", className)} {...props} />
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("h-14 px-2 py-3.5 align-middle text-body text-foreground first:pl-4 last:pr-4 has-[button,input]:py-1", className)} {...props} />
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-label2 text-muted-foreground", className)} {...props} />
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
