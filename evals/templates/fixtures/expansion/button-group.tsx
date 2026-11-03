// button-group's Counterpart, CDS ButtonGroup: a list of separate pill
// buttons 8px apart, never joined, in a list as wide as its container.
// Horizontal keeps each button's own width; vertical makes every button fill
// the group (block). Labels are short enough that the row fits in 320px: CDS
// does not wrap or shrink a row that is too long, it overflows the list.
import { Button, ButtonGroup as CdsButtonGroup } from "@coinbase/cds-web/buttons";
import { VStack } from "@coinbase/cds-web/layout";
import { Hook } from "../Hook";

export default function ButtonGroup() {
  return (
    <VStack gap={3} width={320}>
      <Hook name="button-group-horizontal">
        <CdsButtonGroup accessibilityLabel="คำสั่ง / Actions">
          <Button>ซื้อ / Buy</Button>
          <Button variant="secondary">ขาย / Sell</Button>
        </CdsButtonGroup>
      </Hook>
      <Hook name="button-group-vertical">
        <VStack width={256}>
          <CdsButtonGroup accessibilityLabel="ส่งออก / Export" direction="vertical">
            <Button variant="secondary">ดาวน์โหลด / Download</Button>
            <Button variant="secondary">แชร์ / Share</Button>
          </CdsButtonGroup>
        </VStack>
      </Hook>
    </VStack>
  );
}
