// field, measured against the CDS input stack (fixtures/expansion/field.tsx):
// a field with long Thai helper text, and one in its error state, where the
// error takes the helper's place as in CDS. The fixture wires nothing by hand:
// Field ties its label, helper and error to the control in FieldControl, as
// CDS TextInput does. The last field (unmeasured) does it for an input group.
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
