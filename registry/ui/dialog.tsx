import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The CDS Modal: full screen below 768px; from there a 612px-wide sheet with
// 8px corners (CDS fits it to its content between 768 and 1280). The header
// centers the title beside the close button; the footer stacks its buttons
// full width on phones, the last one on top, and lines them up at the right
// from 768px. Radix hides the rest of the page and returns focus on close.
function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-popover text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] outline-none",
          "md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[calc(100svh-4rem)] md:w-auto md:max-w-[612px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md xl:w-[612px]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({
  className,
  children,
  closeLabel = "Close",
  ...props
}: React.ComponentProps<"div"> & { closeLabel?: string }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-4 border-b border-border px-6 py-4", className)}
      {...props}
    >
      <div className="col-start-2 flex flex-col gap-1 text-center">{children}</div>
      <DialogPrimitive.Close asChild>
        <Button variant="ghost" size="icon" aria-label={closeLabel}>
          <XIcon />
        </Button>
      </DialogPrimitive.Close>
    </div>
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("flex-1 overflow-y-auto p-6 text-body text-foreground", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-4 border-t border-border px-6 py-4 md:flex-row md:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-headline text-foreground", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-body text-foreground", className)} {...props} />
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }
