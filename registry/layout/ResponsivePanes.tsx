import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentView } from "./ContentView"
import { InspectorView } from "./InspectorView"

export type ActivePane = "content" | "inspector"

export interface PaneNavigationProps {
  /** Context and app-owned actions in each pane's persistent 64px header. */
  contentHeader?: ReactNode
  contentActions?: ReactNode
  inspectorHeader?: ReactNode
  inspectorActions?: ReactNode
  /** Omit for internal pane state. Controlled callers must update this in onActivePaneChange. */
  activePane?: ActivePane
  onActivePaneChange?: (pane: ActivePane) => void
  paneLabels?: {
    content?: string
    inspector?: string
    viewDetails?: string
    backToContent?: string
  }
}

/** Keep pane subtrees mounted across selection and breakpoint changes. */
export function ResponsivePanes({
  content, inspector, compact, contentWidth, inspectorWidth, capAt, contentCapAt,
  activePane, onActivePaneChange, paneLabels,
  contentHeader, contentActions, inspectorHeader, inspectorActions,
}: PaneNavigationProps & {
  content: ReactNode
  inspector: ReactNode
  compact: boolean
  contentWidth?: number
  inspectorWidth?: number
  capAt?: number
  contentCapAt?: number
}) {
  const [internalPane, setInternalPane] = useState<ActivePane>("content")
  const current = activePane ?? internalPane
  const contentRef = useRef<HTMLElement>(null)
  const inspectorRef = useRef<HTMLElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const previous = useRef({ compact, current })
  const labels = {
    content: "Content", inspector: "Details",
    viewDetails: "View details", backToContent: "Back to content",
    ...paneLabels,
  }

  function changePane(next: ActivePane) {
    if (activePane === undefined) setInternalPane(next)
    onActivePaneChange?.(next)
  }

  useLayoutEffect(() => {
    const before = previous.current
    const active = document.activeElement
    const hiddenHasFocus = current === "content"
      ? inspectorRef.current?.contains(active)
      : contentRef.current?.contains(active)
    if (compact && (before.current !== current || (!before.compact && hiddenHasFocus))) {
      if (current === "inspector") {
        inspectorRef.current?.focus({ preventScroll: true })
      } else {
        const target = returnFocus.current
        if (target?.isConnected && contentRef.current?.contains(target)) {
          target.focus({ preventScroll: true })
        } else {
          contentRef.current?.focus({ preventScroll: true })
        }
      }
    } else if (!compact && before.compact &&
      (active === document.body || active instanceof HTMLElement && active.closest('[data-pane-control]'))) {
      // The mobile toolbar disappears on desktop; leave focus in the same pane.
      (current === "content" ? contentRef : inspectorRef).current?.focus({ preventScroll: true })
    }
    previous.current = { compact, current }
  }, [compact, current])

  const contentToolbar = compact ? (
    <Button type="button" variant="secondary" size="sm" onClick={() => changePane("inspector")}>
      {labels.viewDetails}
    </Button>
  ) : undefined
  const inspectorToolbar = compact ? (
    <Button type="button" variant="ghost" size="sm" className="-ms-3" onClick={() => changePane("content")}>
      <ArrowLeft />
      {labels.backToContent}
    </Button>
  ) : undefined

  return (
    <>
      <section className={!compact && inspectorWidth === undefined ? "border-e border-border" : undefined}
        ref={contentRef} tabIndex={-1} aria-label={labels.content}
        hidden={compact && current !== "content"}
        onFocusCapture={(event) => {
          if (event.target !== contentRef.current) returnFocus.current = event.target as HTMLElement
        }}
        style={{ boxSizing: "border-box", display: compact && current !== "content" ? "none" : "flex",
          flex: compact || contentWidth === undefined ? 1 : undefined,
          width: compact ? undefined : contentWidth, flexShrink: 0, minWidth: 0, minHeight: 0, height: "100%",
          order: inspectorWidth === undefined ? 0 : 1 }}
      >
        <ContentView width="100%" capAt={compact ? undefined : contentCapAt} toolbar={<div className="neon-pane-header">
          <div className="neon-pane-heading">{contentHeader}</div>
          <div className="neon-pane-actions">{contentActions}{contentToolbar}</div>
        </div>}>
          {content}
        </ContentView>
      </section>
      <section className={!compact && inspectorWidth !== undefined ? "border-e border-border" : undefined}
        ref={inspectorRef} tabIndex={-1} aria-label={labels.inspector}
        hidden={compact && current !== "inspector"}
        style={{ boxSizing: "border-box", display: compact && current !== "inspector" ? "none" : "flex",
          flex: compact || inspectorWidth === undefined ? 1 : undefined,
          width: compact ? undefined : inspectorWidth, flexShrink: 0, minWidth: 0, minHeight: 0, height: "100%" }}
      >
        <InspectorView pane={{ capAt: compact ? undefined : capAt }} toolbar={<div className="neon-pane-header">
          {inspectorToolbar}
          <div className="neon-pane-heading">{inspectorHeader}</div>
          <div className="neon-pane-actions">{inspectorActions}</div>
        </div>}>
          {inspector}
        </InspectorView>
      </section>
    </>
  )
}
