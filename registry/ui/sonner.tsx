import { Toaster as Sonner, type ToasterProps } from "sonner"

// The CDS toast: the secondary fill, 8px corners, headline type, 16px above the
// bottom center. The base's AppRoot renders the one Toaster and passes its
// color scheme as theme, so no theme provider is needed; call toast() from
// "sonner" anywhere.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      offset={16}
      mobileOffset={16}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex min-h-14 w-(--width) items-center gap-4 rounded-md bg-secondary px-6 py-2 text-secondary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
          title: "text-headline",
          description: "text-body text-muted-foreground",
          actionButton: "ml-auto shrink-0 rounded-full bg-primary px-4 py-2 text-label1 text-primary-foreground",
          cancelButton: "shrink-0 rounded-full px-4 py-2 text-label1",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
