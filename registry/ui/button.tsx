import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Button (core/components/button.md): a Capsule in Core's four sizes,
// the label in Medium weight, each fill with its Hover and Active token.
//   default      Primary Default      secondary  Secondary Default
//   destructive  Primary Danger       ghost      Tertiary Default
//   brand        Primary Brand        inverse    Primary Inverse, the white
//   link         Core's Link ink                 button over a photo or a header
// outline is shadcn's and has no value in Core. Hover's fill also shows on
// keyboard focus, as Core's Focus state does. Disabled takes Core's disabled
// fill and label, which dim by their own alpha: no opacity. The focus
// indicator is Core's Focus/focus, 2px, drawn 2px outside the button.
// ghost at an icon size is Core's Icon button, Tertiary
// (core/components/icon-button.md): Disabled it has no fill and its glyph is
// Icon/icon-disabled, where a Tertiary Button with a label keeps the fill.
// Sizes: default is Large (56), md Medium (48), sm Small (36), xs XSmall (28).
// Below Large the label is Core's Subheadline or Footnote in Medium, which no
// type role holds: text-button-md and text-button-xs (theme/neon.css).
// Core's icon is a glyph at the label's size; an svg shows that glyph size
// drawn 1.2× as large (20, 18, 16).
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-headline whitespace-nowrap transition-[color,background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 aria-busy:[-webkit-text-fill-color:transparent] aria-busy:[&>:not([data-slot=button-spinner])]:opacity-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:text-primary-disabled-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover focus-visible:bg-destructive-hover active:bg-destructive-active disabled:bg-button-disabled disabled:text-button-disabled-foreground",
        secondary:
          "bg-button-secondary text-secondary-foreground hover:bg-button-secondary-hover focus-visible:bg-button-secondary-hover active:bg-button-secondary-active disabled:bg-button-disabled disabled:text-button-disabled-foreground",
        outline: "border border-input bg-background text-foreground hover:bg-accent disabled:text-button-disabled-foreground",
        ghost:
          "text-foreground hover:bg-button-secondary-hover focus-visible:bg-button-secondary-hover active:bg-button-secondary-active",
        link: "text-link hover:text-link-hover active:text-link-hover disabled:text-button-disabled-foreground",
        brand:
          "bg-button-brand text-button-brand-foreground hover:bg-button-brand-hover focus-visible:bg-button-brand-hover active:bg-button-brand-active disabled:bg-button-disabled disabled:text-button-disabled-foreground",
        inverse:
          "bg-button-inverse text-button-inverse-foreground hover:bg-button-inverse-hover focus-visible:bg-button-inverse-hover active:bg-button-inverse-active disabled:bg-button-inverse-disabled disabled:text-button-inverse-disabled-foreground",
      },
      size: {
        default: "h-14 px-6 py-4",
        md: "h-12 px-6 py-3 text-button-md [&_svg:not([class*='size-'])]:size-4.5",
        sm: "h-9 gap-1 px-4 py-1.5 text-button-md [&_svg:not([class*='size-'])]:size-4.5",
        xs: "h-7 gap-1 px-3 py-1 text-button-xs [&_svg:not([class*='size-'])]:size-4",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    // ghost's Disabled look goes by size, in two rules that share no property.
    compoundVariants: [
      {
        variant: "ghost",
        size: ["default", "md", "sm", "xs"],
        class: "disabled:bg-button-disabled disabled:text-button-disabled-foreground",
      },
      { variant: "ghost", size: ["icon", "icon-sm"], class: "disabled:text-icon-disabled" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// A loading button does nothing when pressed: the action it started is still running.
function swallow(event: React.SyntheticEvent) {
  event.preventDefault()
  event.stopPropagation()
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /**
     * Core's Loading state: the button keeps its place and size, shows the
     * spinner in place of its content and is announced as busy. It stays
     * focusable and keeps its name; a press does nothing until loading ends.
     */
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      {...(loading && { onClickCapture: swallow })}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      {loading && (
        // Core's _Loading: a 24px ring at every size, one turn a second, still under reduced motion.
        // It takes the label's ink, which Core already holds to contrast on each fill.
        <span
          data-slot="button-spinner"
          aria-hidden="true"
          className="absolute inset-0 m-auto size-6 animate-spin rounded-full border-[3px] border-current/25 border-t-current motion-reduce:animate-none"
        />
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
