import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// The CDS Tag: 24px, label1 type, 4px corners, a status ink on its wash. The
// inks are provisional roles in theme/neon.css (#97).
const tagVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center gap-1 rounded-sm px-1 py-0.5 text-label1 whitespace-nowrap [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-foreground",
        positive: "bg-positive-wash text-tag-positive",
        warning: "bg-warning-wash text-tag-warning",
        negative: "bg-negative-wash text-tag-negative",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

function Tag({ className, variant = "neutral", ...props }: React.ComponentProps<"span"> & VariantProps<typeof tagVariants>) {
  return <span data-slot="tag" data-variant={variant} className={cn(tagVariants({ variant }), className)} {...props} />
}

export { Tag, tagVariants }
