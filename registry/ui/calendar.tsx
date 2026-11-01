import * as React from "react"
import { format } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The CDS calendar: the month in headline type at the left, the arrows at the
// right, round 40px days 8px apart in body type. Today has a primary ring; the
// picked day takes the primary fill. Days of other months are not shown.
// Every date is read through date-fns, so a Thai browser locale never turns
// the year Buddhist; pass a date-fns locale to change the names.
function Calendar({ className, classNames, showOutsideDays = false, components, ...props }: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn("absolute top-0 right-3 flex items-center gap-2", defaultClassNames.nav),
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon" }), "aria-disabled:opacity-50", defaultClassNames.button_previous),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon" }), "aria-disabled:opacity-50", defaultClassNames.button_next),
        month_caption: cn("flex h-10 items-center px-3", defaultClassNames.month_caption),
        caption_label: cn("text-headline text-foreground select-none", defaultClassNames.caption_label),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex gap-2", defaultClassNames.weekdays),
        weekday: cn("flex size-10 items-center justify-center text-body text-foreground select-none", defaultClassNames.weekday),
        week: cn("mt-2 flex gap-2", defaultClassNames.week),
        day: cn("size-10 p-0 text-center select-none", defaultClassNames.day),
        today: defaultClassNames.today,
        outside: cn("text-muted-foreground", defaultClassNames.outside),
        disabled: cn("opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
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

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={format(day.date, "yyyy-MM-dd")}
      data-today={modifiers.today}
      data-selected-single={modifiers.selected}
      className={cn(
        "border border-transparent text-body data-[today=true]:border-primary data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
