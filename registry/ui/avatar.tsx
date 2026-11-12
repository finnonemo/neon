import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Core's Avatar: default is its Small (36px), lg its Medium (48px). Core's other seven sizes
// have no value here.
function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & { size?: "default" | "lg" }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn("group/avatar relative flex size-9 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-12", className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full", className)} {...props} />
}

// Core's Artwork=Initials in Color=Default: the initials in Text/text-on-color on
// Avatar/background. They are Headline at 36px and Title 3 at 48px. Core's 48px initials are
// Strong, an emphasis no Neon type role carries: they keep Title 3's weight.
function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full bg-avatar text-headline text-avatar-foreground group-data-[size=lg]/avatar:text-title3", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
