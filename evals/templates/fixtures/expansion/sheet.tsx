// sheet's Counterpart, CDS Tray, pinned to each side. Tray has no visible
// prop: it is mounted to open and unmounts itself after closing. The bottom
// tray shows the HandleBar, which stands in for the close button there.
import { useState } from "react";
import { Button } from "@coinbase/cds-web/buttons";
import { HStack } from "@coinbase/cds-web/layout";
import { Tray } from "@coinbase/cds-web/overlays";
import { Text } from "@coinbase/cds-web/typography";
import { Hook } from "../Hook";

const sides = ["bottom", "top", "left", "right"] as const;

export default function Sheet() {
  const [pin, setPin] = useState<(typeof sides)[number] | null>(null);
  return (
    <>
      <HStack gap={1} flexWrap="wrap">
        {sides.map((side) => (
          <Hook key={side} name={`sheet-${side}`}>
            <Button variant="secondary" onClick={() => setPin(side)}>{side}</Button>
          </Hook>
        ))}
      </HStack>
      {pin && (
        <Tray pin={pin} showHandleBar={pin === "bottom"} title="ตัวกรอง / Filters" closeAccessibilityLabel="ปิด / Close" onCloseComplete={() => setPin(null)}>
          <Text as="p" font="body">เลือกช่วงเวลาและสถานะของคำขอที่ต้องการดู / Choose the period and status of the requests to show.</Text>
        </Tray>
      )}
    </>
  );
}
