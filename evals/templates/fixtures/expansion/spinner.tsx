// spinner's Counterpart, CDS Spinner: a ring 10× its size wide with a border
// 1.1× its size, three sides bgAlternate and the bottom arc in its color
// (fgMuted). The spin is paused from mount, so the ring rests at rotate(0) and
// measures stably: a rotating box's bounds change every frame.
import { HStack } from "@coinbase/cds-web/layout";
import { Spinner as CdsSpinner } from "@coinbase/cds-web/loaders";
import { Hook } from "../Hook";

const paused = { animationPlayState: "paused" } as const;

export default function Spinner() {
  return (
    <HStack gap={2} alignItems="center">
      <Hook name="spinner-default">
        <CdsSpinner size={1.6} style={paused} accessibilityLabel="กำลังโหลด / Loading" />
      </Hook>
      <Hook name="spinner-large">
        <CdsSpinner size={4} style={paused} accessibilityLabel="กำลังโหลด / Loading" />
      </Hook>
    </HStack>
  );
}
