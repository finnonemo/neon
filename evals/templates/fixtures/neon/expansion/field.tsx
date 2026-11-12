// field, measured against Core's Text field and the CDS input stack
// (fixtures/expansion/field.tsx): a field with long Thai helper text, one in
// its error state, where the error takes the helper's place, and a disabled
// one (Neon only). The fixture wires nothing by hand: Field ties its label,
// helper and error to the control in FieldControl. The input-group field
// (unmeasured) does it for an input group.
import { SearchIcon } from "lucide-react"

import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Hook } from "../Hook"

export default function FieldSection() {
  return (
    <div className="flex w-64 flex-col gap-6">
      <Hook name="field-helper">
        <Field>
          <FieldLabel>ชื่อบัญชี / Account name</FieldLabel>
          <FieldControl><Input placeholder="ชื่อตามสมุดบัญชี" /></FieldControl>
          <FieldDescription>
            ใช้ชื่อเดียวกับที่ปรากฏในสมุดบัญชีธนาคาร เพื่อให้การโอนเงินไม่ล่าช้า / Use the name in your bank book
          </FieldDescription>
        </Field>
      </Hook>
      <Hook name="field-error">
        <Field>
          <FieldLabel>อีเมล / Email</FieldLabel>
          <FieldControl><Input defaultValue="kanya@" /></FieldControl>
          <FieldError>รูปแบบอีเมลไม่ถูกต้อง / Invalid email</FieldError>
        </Field>
      </Hook>
      <Hook name="field-disabled">
        <Field data-disabled="true">
          <FieldLabel>รหัสพนักงาน / Employee ID</FieldLabel>
          <FieldControl><Input disabled defaultValue="FN-0042" /></FieldControl>
          <FieldDescription>แก้ไขไม่ได้ / Cannot be changed</FieldDescription>
        </Field>
      </Hook>
      <Hook name="field-input-group">
        <Field>
          <FieldLabel>ผู้ขอ / Requester</FieldLabel>
          <InputGroup>
            <FieldControl><InputGroupInput placeholder="ชื่อผู้ขอ" /></FieldControl>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>ค้นหาด้วยชื่อหรืออีเมล / Search by name or email</FieldDescription>
        </Field>
      </Hook>
    </div>
  )
}
