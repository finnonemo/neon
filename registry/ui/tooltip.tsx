import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Tooltip (core/components/tooltip.md): the tip is Background/background-inverse with 8px
// corners, padded 16 at its sides, its Subheadline label in Text/text-inverse. size is Core's
// Size: sm pads 2 above and below and wraps its label past 176px (an icon's name), default 8 and
// 144px, lg 16 and 256px (a definition). The caret is 16 by 8, or 8 by 4 at sm, in the tip's fill,
// kept 16px (20 at sm) from the tip's corners, and meets the trigger's box: sideOffset is 0.
// The base's AppRoot renders the one TooltipProvider, so a Tooltip needs none of its own.
// Core opens after 100ms of hover and at once on keyboard focus.
function TooltipProvider({ delayDuration = 100, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const sizes = {
  sm: "max-w-52 py-0.5",
  default: "max-w-44 py-2",
  lg: "max-w-72 py-4",
}

function TooltipContent({
  className,
  size = "default",
  sideOffset = 0,
  arrowPadding,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & { size?: keyof typeof sizes }) {
  const small = size === "sm"
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-size={size}
        sideOffset={sideOffset}
        arrowPadding={arrowPadding ?? (small ? 20 : 16)}
        className={cn(
          "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-inverse px-4 text-label2 text-balance text-inverse-foreground",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow data-slot="tooltip-arrow" width={small ? 8 : 16} height={small ? 4 : 8} className="fill-inverse" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
