// field's Counterpart, the CDS input stack: TextInput lays its label, field
// and helper text out with InputStack (4px apart). The negative variant turns
// the field's border and the helper text red and puts an info icon before it.
// The last field (unmeasured) gives the TextInput a start icon, as the Neon
// fixture puts an input group in a field.
import { InputIcon, TextInput } from "@coinbase/cds-web/controls";
import { VStack } from "@coinbase/cds-web/layout";
import { Hook } from "../Hook";

export default function Field() {
  return (
    <VStack gap={3} width={256}>
      <Hook name="field-helper">
        <TextInput
          label="ชื่อบัญชี / Account name"
          placeholder="ชื่อตามสมุดบัญชี"
          helperText="ใช้ชื่อเดียวกับที่ปรากฏในสมุดบัญชีธนาคาร เพื่อให้การโอนเงินไม่ล่าช้า / Use the name in your bank book"
          testIDMap={{ label: "field-helper-label", helperText: "field-helper-text" }}
        />
      </Hook>
      <Hook name="field-error">
        <TextInput
          label="อีเมล / Email"
          value="kanya@"
          onChange={() => {}}
          variant="negative"
          helperText="รูปแบบอีเมลไม่ถูกต้อง / Invalid email"
          testIDMap={{ label: "field-error-label", helperText: "field-error-text" }}
        />
      </Hook>
      <Hook name="field-input-group">
        <TextInput
          label="ผู้ขอ / Requester"
          placeholder="ชื่อผู้ขอ"
          start={<InputIcon name="search" />}
          helperText="ค้นหาด้วยชื่อหรืออีเมล / Search by name or email"
        />
      </Hook>
    </VStack>
  );
}
