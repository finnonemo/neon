import * as React from "react"
import { format as formatDate, type Locale } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// The CDS DatePicker: a 56px field like Input that opens the calendar in a
// popover. The field shows the date in the caller's date-fns format, never a
// locale default, so a Thai browser never shows a Buddhist year.
function DatePicker({
  value,
  onChange,
  format = "dd/MM/yyyy",
  locale,
  placeholder = format.toLowerCase(),
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "value" | "onChange"> & {
  value?: Date
  onChange?: (date: Date | undefined) => void
  format?: string
  locale?: Locale
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-picker"
          data-empty={!value}
          className={cn(
            "flex h-14 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background pr-3 pl-4 text-left text-body text-foreground transition-[border-color,box-shadow] outline-none data-[empty=true]:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            className
          )}
          {...props}
        >
          <span className="truncate">{value ? formatDate(value, format, { locale }) : placeholder}</span>
          <CalendarIcon className="size-5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          locale={locale}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
