/**
 * Framework-agnostic breakpoint hook, keyed off ../theme/breakpoints.config.ts
 * (copied in from neon-create at scaffold time).
 *
 * Confirmed (against the real @coinbase/cds-web@9.26.1 types) that
 * MediaQueryProvider does NOT accept a custom-breakpoints prop — its only
 * props are `children` and `defaultValues` (a one-time initial snapshot,
 * not a breakpoint config, per dts/system/MediaQueryProvider.d.ts). This
 * plain matchMedia-based hook is the correct approach here, not a
 * placeholder pending verification — see neon-create/SKILL.md's known
 * limitations for the citation.
 */
import { useEffect, useState } from "react";
import { breakpoints, type BreakpointName } from "../theme/breakpoints.config";

/**
 * Breakpoints are sorted narrowest-to-widest and contiguous, so scanning
 * from the widest down and returning the first tier whose minWidth is at
 * or below the given width correctly handles every width in range. Widths
 * narrower than the first tier's minWidth (< 320px) fall through to the
 * first (narrowest) tier, not the last — a fixed bug: the previous
 * forward-scanning version fell through to the *widest* tier for any
 * out-of-range width, so a sub-320px viewport got a full desktop layout.
 */
function tierForWidth(width: number): BreakpointName {
  for (let i = breakpoints.length - 1; i >= 0; i--) {
    if (width >= breakpoints[i].minWidth) return breakpoints[i].name;
  }
  return breakpoints[0].name;
}

export function useBreakpointTier(): BreakpointName {
  const [tier, setTier] = useState<BreakpointName>(() =>
    typeof window === "undefined" ? breakpoints[0].name : tierForWidth(window.innerWidth)
  );

  useEffect(() => {
    const update = () => setTier(tierForWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return tier;
}
