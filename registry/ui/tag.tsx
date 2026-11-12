import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Core's Display tag in Secondary: a tinted fill with its own ink and no stroke. neutral is
// Core's Navy, positive Green, warning Orange and negative Red. The default size is Core's
// Small (24px, Footnote, 4px corners), a status beside a row's text; md and lg are its Medium
// (32px, Subheadline) and Large (40px, Body), both with 8px corners. Core's XSmall, its Primary
// and Tertiary and its other Colors have no value here.
const tagVariants = cva("inline-flex w-fit shrink-0 items-center whitespace-nowrap", {
  variants: {
    variant: {
      neutral: "bg-selection-tag text-selection-tag-foreground",
      positive: "bg-tag-positive-wash text-tag-positive",
      warning: "bg-tag-warning-wash text-tag-warning",
      negative: "bg-tag-negative-wash text-tag-negative",
    },
    size: {
      sm: "min-h-6 gap-1 rounded-sm px-1.5 py-0.5 text-legal [&>svg]:size-3.5",
      md: "min-h-8 gap-2 rounded-md px-2 py-1 text-label2 [&>svg]:size-4",
      lg: "min-h-10 gap-3 rounded-md p-2 text-body [&>svg]:size-4",
    },
  },
  defaultVariants: { variant: "neutral", size: "sm" },
})

function Tag({ className, variant = "neutral", size = "sm", ...props }: React.ComponentProps<"span"> & VariantProps<typeof tagVariants>) {
  return <span data-slot="tag" data-variant={variant} data-size={size} className={cn(tagVariants({ variant, size }), className)} {...props} />
}

export { Tag, tagVariants }
