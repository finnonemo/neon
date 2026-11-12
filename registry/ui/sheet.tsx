import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Core's Sheet at iOS=False (core/components/sheet.md), its Modal sheet: flush with the bottom
// across the width, on Layer/layer-01 with 16px corners at its top only, padded 16 above, with
// no stroke, over the Miscellaneous/overlay Dimming Layer. Core's sheet opens from the bottom
// alone: the top, left and right sides are Neon's, drawn the same way with the open edge's two
// corners rounded. Bottom and top sheets are up to 85% of the height, their content column
// capped at 70em; left and right sheets are min(400px, 100vw) wide and full height. A bottom
// sheet shows Core's Grabber, which is its close button; the other sides show an X. Radix closes
// it on Escape or a scrim click and returns focus to the trigger; there is no drag to dismiss
// and there are no detents. The snapshot has no Elevation token, so the shadow is Neon's.
type Side = "top" | "right" | "bottom" | "left"

const SheetSide = React.createContext<Side>("right")

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

const sides: Record<Side, string> = {
  bottom: "inset-x-0 bottom-0 max-h-[85%] rounded-t-xl data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  top: "inset-x-0 top-0 max-h-[85%] rounded-b-xl data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
  left: "inset-y-0 left-0 w-[min(400px,100vw)] rounded-r-xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  right: "inset-y-0 right-0 w-[min(400px,100vw)] rounded-l-xl data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: Side }) {
  const across = side === "top" || side === "bottom"
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col items-center overflow-hidden bg-popover pt-4 text-body text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] outline-none",
          "data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=closed]:animate-out data-[state=closed]:duration-300",
          sides[side],
          className
        )}
        {...props}
      >
        <SheetSide.Provider value={side}>
          <div className={cn("flex min-h-0 w-full flex-1 flex-col", across && "max-w-[70em]")}>{children}</div>
        </SheetSide.Provider>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

// Core's Header is its Toolbar, which the registry has no item for: this header is Neon's, the
// title 16px under the sheet's own padding (flush with it on a top sheet). On a bottom sheet
// Core's Grabber sits over it: a 48 by 4px Border/border-subtle bar 8px from the top, in a 96 by
// 48px target centered on the sheet. The target is the close button; keyboard focus is Core's
// 2px Focus/focus stroke inside it.
function SheetHeader({
  className,
  children,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<"div"> & { closeLabel?: string }) {
  const side = React.useContext(SheetSide)
  const sideways = side === "left" || side === "right"
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex shrink-0 flex-col overflow-hidden border-b border-transparent pb-1.5", side === "top" ? "pt-0" : "pt-4", className)}
      {...props}
    >
      {side === "bottom" && (
        <SheetPrimitive.Close
          data-slot="sheet-handle-bar"
          aria-label={closeLabel}
          className="absolute top-0 left-1/2 flex h-12 w-24 -translate-x-1/2 cursor-grab justify-center rounded-lg pt-2 outline-2 -outline-offset-2 outline-transparent focus-visible:outline-ring"
        >
          <span data-slot="sheet-handle" className="h-1 w-12 rounded-full bg-border" />
        </SheetPrimitive.Close>
      )}
      <div className={cn("flex justify-between px-6 md:px-8", sideways ? "items-start" : "items-center")}>
        <div className="flex min-w-0 flex-col gap-1">{children}</div>
        {side !== "bottom" && (
          <SheetPrimitive.Close asChild>
            <Button data-slot="sheet-close" variant="ghost" size="icon" aria-label={closeLabel} className={cn(sideways && "-m-3")}>
              <XIcon className="size-4" />
            </Button>
          </SheetPrimitive.Close>
        )}
      </div>
    </div>
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("min-h-0 flex-1 overflow-y-auto px-6 md:px-8", className)} {...props} />
}

// Core's Footer is a Slot for its Button dock, which the registry has no item for: this only
// lines the footer up with the body.
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("flex shrink-0 flex-col gap-2 px-6 py-4 md:px-8", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-title3 text-foreground", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-body text-muted-foreground", className)} {...props} />
}

export { Sheet, SheetBody, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger }
