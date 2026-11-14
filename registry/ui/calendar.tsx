import * as React from "react"
import { format } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DateLib, DayPicker, getDefaultClassNames, type DayButton, type Formatters } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Core's Date and time, the month grid of its Pickers set
// (core/components/date-and-time.md, the iOS=False look): a 48px Header with
// the month in Headline at the left and two 48px arrows at the right, the
// weekdays as one letter in Footnote, and weeks of 48px days with no gap, so
// the grid is 336px wide. A day's number is Title 3 inside a 36px round Mark.
// The Mark is the disc of a picked day (layer-selected-inverse under an
// inverse number), takes layer-hover under the pointer and carries the focus
// ring. Today is link ink with a 4px dot under the number; a disabled day is
// text-disabled, with no opacity. mode="range" draws Core's Range start, In
// range and Range end: a 36px highlight band behind the days, each end a
// picked disc over half of it. Days of other months are not shown.
// The arrows are Core's Icon button, Tertiary Medium; one that cannot move
// (the first or last month, or disableNavigation) takes its Disabled ink.
// The item is the Date part of Pickers only. The surface and the side padding
// of Core's Inline and Compact styles are the container's (a popover brings
// its own), and Core's Time row, its month and year list and Date and time -
// Collapsed have no Neon item. react-day-picker's other props (mode="multiple",
// showOutsideDays, numberOfMonths, captionLayout="dropdown", showWeekNumber)
// keep working and have no cell in Core.
// Every date is read through date-fns, so a Thai browser locale never turns
// the year Buddhist; pass a date-fns locale to change the names.
const arrow = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-12 text-icon aria-disabled:pointer-events-none aria-disabled:bg-transparent aria-disabled:text-icon-disabled"
)

// Core's weekdays are one letter (S M T W T F S); the header cell keeps the full name as its label.
const formatWeekdayName: Formatters["formatWeekdayName"] = (weekday, options, dateLib) => (dateLib ?? new DateLib(options)).format(weekday, "ccccc")

function Calendar({ className, classNames, showOutsideDays = false, formatters, components, ...props }: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex flex-col", defaultClassNames.month),
        nav: cn("absolute top-0 right-0 flex h-12 items-center", defaultClassNames.nav),
        button_previous: cn(arrow, defaultClassNames.button_previous),
        button_next: cn(arrow, defaultClassNames.button_next),
        month_caption: cn("flex h-12 items-center pl-2", defaultClassNames.month_caption),
        caption_label: cn("text-headline text-foreground select-none", defaultClassNames.caption_label),
        month_grid: cn("border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn("flex w-12 items-center justify-center text-legal text-muted-foreground select-none", defaultClassNames.weekday),
        week: cn("flex", defaultClassNames.week),
        // A day with no button (no mode) is the number alone, in the same type.
        day: cn("flex size-12 items-center justify-center p-0 text-title3 text-foreground select-none", defaultClassNames.day),
        today: defaultClassNames.today,
        outside: cn("text-muted-foreground", defaultClassNames.outside),
        disabled: cn("text-disabled-foreground", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      formatters={{ formatWeekdayName, ...formatters }}
      components={{
        Root: ({ className, rootRef, ...props }) => <div data-slot="calendar" ref={rootRef} className={className} {...props} />,
        Chevron: ({ className, orientation, ...props }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon
          return <Icon className={cn("size-5", className)} {...props} />
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

// Core's _Day: a 48px cell, the target, around the 36px Mark. The ends of a
// range are drawn as Selected and the days between as Default, over the band.
function CalendarDayButton({ className, day, modifiers, children, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // A range of one day is both ends: a disc and no band.
  const range =
    modifiers.range_start && modifiers.range_end ? undefined : modifiers.range_start ? "start" : modifiers.range_end ? "end" : modifiers.range_middle ? "middle" : undefined
  const picked = Boolean(modifiers.selected && !modifiers.range_middle)

  return (
    <button
      ref={ref}
      data-slot="calendar-day"
      data-day={format(day.date, "yyyy-MM-dd")}
      data-today={modifiers.today}
      data-selected-single={modifiers.selected}
      data-range={range}
      aria-current={modifiers.today ? "date" : undefined}
      className={cn(
        "group/day relative flex size-12 items-center justify-center text-title3 text-foreground outline-none select-none",
        modifiers.outside && "text-muted-foreground",
        modifiers.today && "text-link",
        modifiers.disabled && "pointer-events-none text-disabled-foreground",
        picked && "text-inverse-foreground",
        className
      )}
      {...props}
    >
      {range && (
        <span
          data-slot="calendar-day-band"
          aria-hidden="true"
          className={cn("absolute inset-y-1.5 bg-highlight", range === "middle" ? "inset-x-0" : range === "start" ? "right-0 left-1/2" : "right-1/2 left-0")}
        />
      )}
      <span
        data-slot="calendar-day-mark"
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full group-focus-visible/day:outline-2 group-focus-visible/day:outline-offset-2 group-focus-visible/day:outline-ring",
          picked ? "bg-layer-selected-inverse" : "group-hover/day:bg-layer-hover"
        )}
      >
        <span data-slot="calendar-day-number">{children}</span>
      </span>
      {modifiers.today && !picked && <span data-slot="calendar-day-dot" aria-hidden="true" className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 bg-link" />}
    </button>
  )
}

export { Calendar, CalendarDayButton }
