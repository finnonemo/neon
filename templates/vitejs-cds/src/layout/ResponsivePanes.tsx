import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentView } from "./ContentView";
import { InspectorView } from "./InspectorView";

export type ActivePane = "content" | "inspector";

export interface PaneNavigationProps {
  /** Omit for internal pane state. Controlled callers must update this in onActivePaneChange. */
  activePane?: ActivePane;
  onActivePaneChange?: (pane: ActivePane) => void;
  paneLabels?: {
    content?: string;
    inspector?: string;
    viewDetails?: string;
    backToContent?: string;
  };
}

/** Keep pane subtrees mounted across selection and breakpoint changes. */
export function ResponsivePanes({
  content, inspector, compact, contentWidth, inspectorWidth, capAt, contentCapAt,
  activePane, onActivePaneChange, paneLabels,
}: PaneNavigationProps & {
  content: ReactNode;
  inspector: ReactNode;
  compact: boolean;
  contentWidth?: number;
  inspectorWidth?: number;
  capAt?: number;
  contentCapAt?: number;
}) {
  const [internalPane, setInternalPane] = useState<ActivePane>("content");
  const current = activePane ?? internalPane;
  const contentRef = useRef<HTMLElement>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const previous = useRef({ compact, current });
  const labels = {
    content: "Content", inspector: "Details",
    viewDetails: "View details", backToContent: "Back to content",
    ...paneLabels,
  };

  function changePane(next: ActivePane) {
    if (activePane === undefined) setInternalPane(next);
    onActivePaneChange?.(next);
  }

  useLayoutEffect(() => {
    const before = previous.current;
    const active = document.activeElement;
    const hiddenHasFocus = current === "content"
      ? inspectorRef.current?.contains(active)
      : contentRef.current?.contains(active);
    if (compact && (before.current !== current || (!before.compact && hiddenHasFocus))) {
      if (current === "inspector") {
        inspectorRef.current?.focus({ preventScroll: true });
      } else {
        const target = returnFocus.current;
        if (target?.isConnected && contentRef.current?.contains(target)) {
          target.focus({ preventScroll: true });
        } else {
          contentRef.current?.focus({ preventScroll: true });
        }
      }
    } else if (!compact && before.compact &&
      (active === document.body || active instanceof HTMLElement && active.closest('[data-pane-control]'))) {
      // The mobile toolbar disappears on desktop; leave focus in the same pane.
      (current === "content" ? contentRef : inspectorRef).current?.focus({ preventScroll: true });
    }
    previous.current = { compact, current };
  }, [compact, current]);

  const contentToolbar = compact ? (
    <Button type="button" size="s" onClick={() => changePane("inspector")}>
      {labels.viewDetails}
    </Button>
  ) : undefined;
  const inspectorToolbar = compact ? (
    <Button type="button" size="s" onClick={() => changePane("content")}>
      {labels.backToContent}
    </Button>
  ) : undefined;

  return (
    <>
      <section
        ref={contentRef} tabIndex={-1} aria-label={labels.content}
        hidden={compact && current !== "content"}
        onFocusCapture={(event) => {
          if (event.target !== contentRef.current) returnFocus.current = event.target as HTMLElement;
        }}
        style={{ display: compact && current !== "content" ? "none" : "flex",
          flex: compact || contentWidth === undefined ? 1 : undefined,
          width: compact ? undefined : contentWidth, flexShrink: 0, minWidth: 0, minHeight: 0, height: "100%",
          order: inspectorWidth === undefined ? 0 : 1 }}
      >
        <ContentView width={compact ? "100%" : contentWidth ?? "100%"} capAt={compact ? undefined : contentCapAt} toolbar={contentToolbar}>
          {content}
        </ContentView>
      </section>
      <section
        ref={inspectorRef} tabIndex={-1} aria-label={labels.inspector}
        hidden={compact && current !== "inspector"}
        style={{ display: compact && current !== "inspector" ? "none" : "flex",
          flex: compact || inspectorWidth === undefined ? 1 : undefined,
          width: compact ? undefined : inspectorWidth, flexShrink: 0, minWidth: 0, minHeight: 0, height: "100%" }}
      >
        <InspectorView pane={{ capAt: compact ? undefined : capAt }} toolbar={inspectorToolbar}>
          {inspector}
        </InspectorView>
      </section>
    </>
  );
}
