import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Checkbox (Type=Inset): a 24px Box that paints nothing and holds the glyph, Icon/Large
// (17px type, so a 14.875px square) in Icon/icon-primary. The glyph is the whole indicator and
// is always there, so ticking moves nothing: an outlined square when unchecked, a filled square
// cut by a check when checked and by a bar when indeterminate (Core's square, square-check and
// square-minus, drawn here at their proportions). Disabled takes Icon/icon-disabled with no
// opacity, and a Label beside the checkbox follows it (peer-disabled). Keyboard focus is Core's
// square Focus ring, Focus/focus 2px wide, its outer edge 4px out from the Box. Core has no
// invalid checkbox: aria-invalid draws the glyph in the invalid role. Indeterminate is set by
// the app (checked="indeterminate"); a tap takes it to checked.
// Radix sets data-state, which radix-nova's data-checked: classes never match.
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-6 shrink-0 items-center justify-center text-icon transition-[color,outline-color] aria-invalid:text-invalid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:text-icon-disabled disabled:aria-invalid:text-icon-disabled",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator forceMount asChild>
        <svg
          data-slot="checkbox-indicator"
          viewBox="0 0 448 448"
          fill="currentColor"
          fillRule="evenodd"
          aria-hidden="true"
          className="group/checkbox-indicator block size-[14.875px] shrink-0"
        >
          <path className="hidden group-data-[state=unchecked]/checkbox-indicator:block" d="M0 0H448V448H0ZM48 48V400H400V48Z" />
          <path className="hidden group-data-[state=checked]/checkbox-indicator:block" d="M0 0H448V448H0ZM103 229L192 318L345 165L311 131L192 250L137 195Z" />
          <path className="hidden group-data-[state=indeterminate]/checkbox-indicator:block" d="M0 0H448V448H0ZM112 200V248H336V200Z" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
