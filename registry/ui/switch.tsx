import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Toggle (Style=Toggle only): a 48x24 pill track with 3px of padding round an 18px thumb
// that slides 24px when on. The track is Miscellaneous/toggle-off, and Support/support-success
// when on; the thumb is Icon/icon-on-color. Disabled takes Core's disabled tokens with no
// opacity: the track Button/button-disabled, on or off, and the thumb icon-on-color-disabled; a
// Label beside the switch follows it (peer-disabled). Core's web Toggle draws no Focus state and
// has no invalid one: keyboard focus shows the Button's indicator, Focus/focus 2px wide and 2px
// out, and aria-invalid the same outline in the invalid role. Radix sets data-state, which
// radix-nova's data-checked: classes never match.
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-12 shrink-0 items-center rounded-full bg-toggle-off p-[3px] transition-[background-color,outline-color] data-[state=checked]:bg-toggle-on",
        "aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-invalid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:bg-button-disabled data-[state=checked]:disabled:bg-button-disabled disabled:aria-invalid:outline-0",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4.5 rounded-full bg-toggle-thumb transition-transform data-[disabled]:bg-toggle-thumb-disabled data-[state=checked]:translate-x-6"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
