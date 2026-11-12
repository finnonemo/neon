import { Toaster as Sonner, type ToasterProps } from "sonner"

// Core's Snackbar (core/components/snackbar.md): a Container on Background/background-inverse at
// least 56px tall with 16px corners, padded 16 at its sides, its text in Text/text-inverse padded
// 16 above and below. A status icon sits in a 24px box, 16px from the text, in Icon/icon-inverse.
// The action and cancel buttons are Core's Button, Tertiary Inverse at Medium: 48px, padded 24,
// Hover Button/button-tertiary-inverse-hover, focus Focus/focus-inverse; beside one the Container
// pads 4 at its end. Core's text is Callout, which no type role holds: the title stays Headline.
// Core has one text, so a description is Neon's own, in label2. Core's Close (an Icon button
// beside the action) is not drawn: sonner's closeButton keeps its own look. It sits 16px above
// the bottom center. The base's AppRoot renders the one Toaster and passes its color scheme as
// theme, so no theme provider is needed; call toast() from "sonner" anywhere.
const button =
  "inline-flex min-h-12 shrink-0 items-center justify-center rounded-full px-6 py-3 text-button-md text-inverse-foreground transition-colors hover:bg-button-tertiary-inverse-hover focus-visible:bg-button-tertiary-inverse-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-inverse active:bg-button-tertiary-inverse-active"

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      offset={16}
      mobileOffset={16}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex min-h-14 w-(--width) items-center gap-2 rounded-xl bg-inverse px-4 text-inverse-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)] has-[[data-button]]:pr-1",
          icon: "mr-2 flex size-6 shrink-0 items-center justify-center [&_svg]:size-5",
          content: "flex min-w-0 flex-1 flex-col py-4",
          title: "text-headline",
          description: "text-label2",
          actionButton: button,
          cancelButton: button,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
