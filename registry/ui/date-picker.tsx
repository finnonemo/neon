import * as React from "react"
import { format as formatDate, type Locale } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { CaptionLabel } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Core's Date picker, Single at Large (core/components/date-picker.md, the
// iOS=False look): one Date field with the calendar opening 4px under it.
// The field is Core's Date field (core/components/date-field.md), Text
// field's 56px Field with a calendar glyph in Icon/icon-primary at its end:
// Field/field with 8px corners, 16px at each side and no stroke at rest, the
// date in body type, the placeholder ink while it is empty, and
// Field/field-hover under the pointer. Keyboard focus, Invalid and Disabled
// are Input's; Disabled also takes Icon/icon-disabled on the glyph. The
// field keeps its Enabled look while the calendar is open: Core shows Open
// by the calendar.
// The calendar is the calendar item on Core's Compact surface
// (core/components/date-and-time.md): 370px wide on Layer/layer-01 with 16px
// corners, a dialog named by its month, with focus on the picked day, else
// today. The snapshot has no Elevation token, so the surface keeps the
// popover's stroke and shadow. Where the room is narrower than 370px the
// side padding gives way first, and under the grid's 336px the surface
// scrolls sideways.
// The field is a button: it opens the calendar and is not typed in. Core's
// field is a text input that also takes a typed date, and its Range Type and
// Medium and Small Sizes have no Neon prop.
// The field shows the date in the caller's date-fns format, never a locale
// default, so a Thai browser never shows a Buddhist year.
const MonthId = React.createContext<string | undefined>(undefined)

// The calendar's month heading, with the id the dialog is labelled by.
function MonthLabel(props: React.ComponentProps<typeof CaptionLabel>) {
  return <span id={React.useContext(MonthId)} {...props} />
}

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
  const monthId = React.useId()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-picker"
          data-empty={!value}
          className={cn(
            "group/date-picker flex h-14 w-full min-w-0 items-center justify-between gap-4 rounded-md bg-field px-4 text-left text-body text-foreground transition-[background-color,outline-color] select-none hover:bg-field-hover data-[empty=true]:text-placeholder",
            "focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring",
            "aria-invalid:bg-background aria-invalid:outline-3 aria-invalid:-outline-offset-3 aria-invalid:outline-invalid aria-invalid:hover:bg-background aria-invalid:focus-visible:outline-ring",
            "disabled:pointer-events-none disabled:bg-field-disabled disabled:text-disabled-foreground disabled:aria-invalid:bg-field-disabled disabled:aria-invalid:outline-0 disabled:data-[empty=true]:text-disabled-foreground",
            className
          )}
          {...props}
        >
          <span data-slot="date-picker-value" className="truncate">
            {value ? formatDate(value, format, { locale }) : placeholder}
          </span>
          <CalendarIcon aria-hidden="true" className="pointer-events-none size-5 shrink-0 text-icon group-disabled/date-picker:text-icon-disabled" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} aria-labelledby={monthId} className="w-[370px] overflow-x-auto rounded-xl px-0">
        <MonthId.Provider value={monthId}>
          <Calendar
            mode="single"
            autoFocus
            selected={value}
            defaultMonth={value}
            locale={locale}
            className="mx-auto"
            components={{ CaptionLabel: MonthLabel }}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
            }}
          />
        </MonthId.Provider>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
