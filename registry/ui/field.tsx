import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { InfoIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// The CDS input stack (InputStack, as TextInput lays it out): the label, the
// control and the helper text 4px apart. The label is label2 in the muted
// role with 4px above and below it; helper text is label2, muted, and turns
// into the error in fgNegative with CDS's info icon before it. Tie the helper
// and error to the control yourself, as CDS does: give FieldDescription or
// FieldError an id, and pass it to the control's aria-describedby with
// aria-invalid. FieldError is role=alert, so it is announced when it appears.
// PROVISIONAL (#195): the legend, title, separator and choice-card roles have
// no part in the CDS input stack to match.
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

// PROVISIONAL (#195): a legend is headline in fg; its label variant follows FieldLabel.
function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-2 text-foreground data-[variant=label]:mb-1 data-[variant=label]:text-label2 data-[variant=label]:text-muted-foreground data-[variant=legend]:text-headline",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-6 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva("group/field flex w-full", {
  variants: {
    orientation: {
      vertical: "flex-col gap-1 *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center gap-2 has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto *:data-[slot=field-label]:py-0 has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-0.5",
      responsive:
        "flex-col gap-1 *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-2 @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-0.5",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1", className)}
      {...props}
    />
  )
}

// As a choice card (a Field inside the label), PROVISIONAL (#195): the checked
// border is bgPrimary, 2.57:1 on the page in dark.
function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 py-1 group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border has-[>[data-slot=field]]:py-0 *:data-[slot=field]:p-4",
        "has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-[3px] has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50",
        "has-[>[data-slot=field]]:has-data-[state=checked]:border-primary",
        className
      )}
      {...props}
    />
  )
}

// PROVISIONAL (#195): body in fg, as the Neon checkbox's label.
function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-body text-foreground group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-start text-label2 wrap-break-word text-muted-foreground group-data-[orientation=horizontal]/field:text-balance",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn("relative -my-2 h-5 text-label2 group-data-[variant=outline]/field-group:-mb-2", className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-start text-label2 wrap-break-word text-negative", className)}
      {...props}
    >
      <span data-slot="field-error-icon" aria-hidden="true" className="inline-block pe-1">
        <InfoIcon className="block size-3" />
      </span>
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
