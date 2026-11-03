// input-group's Counterpart, CDS TextInput's start and end slots: an icon at
// the start, a text suffix at the end, and an icon button at the end. The
// slots sit inside the field's border; the input loses its start padding to a
// start node and keeps its end padding before an end node.
import { InputIcon, InputIconButton, TextInput } from "@coinbase/cds-web/controls";
import { VStack } from "@coinbase/cds-web/layout";
import { Hook } from "../Hook";

export default function InputGroup() {
  return (
    <VStack gap={3} width={256}>
      <Hook name="input-group-start">
        <TextInput
          accessibilityLabel="ค้นหา / Search"
          placeholder="ชื่อผู้ขอ"
          start={<InputIcon name="search" />}
          testIDMap={{ start: "input-group-start-slot" }}
        />
      </Hook>
      <Hook name="input-group-suffix">
        <TextInput
          accessibilityLabel="จำนวนเงิน / Amount"
          value="1,000"
          onChange={() => {}}
          suffix="THB"
          testIDMap={{ end: "input-group-suffix-slot" }}
        />
      </Hook>
      <Hook name="input-group-button">
        <TextInput
          accessibilityLabel="รหัสอ้างอิง / Reference"
          value="FN-2026-0042"
          onChange={() => {}}
          end={<InputIconButton name="close" accessibilityLabel="ล้าง / Clear" />}
          testIDMap={{ end: "input-group-button-slot" }}
        />
      </Hook>
    </VStack>
  );
}
