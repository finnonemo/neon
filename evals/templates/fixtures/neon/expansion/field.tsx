// field, measured against the CDS input stack (fixtures/expansion/field.tsx):
// a field with long Thai helper text, and one in its error state, where the
// error takes the helper's place as in CDS. Each control names its helper or
// error in aria-describedby.
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Hook } from "../Hook"

export default function FieldSection() {
  return (
    <div className="flex w-64 flex-col gap-6">
      <Hook name="field-helper">
        <Field>
          <FieldLabel htmlFor="field-account-name">ชื่อบัญชี / Account name</FieldLabel>
          <Input id="field-account-name" placeholder="ชื่อตามสมุดบัญชี" aria-describedby="field-account-name-helper" />
          <FieldDescription id="field-account-name-helper">
            ใช้ชื่อเดียวกับที่ปรากฏในสมุดบัญชีธนาคาร เพื่อให้การโอนเงินไม่ล่าช้า / Use the name in your bank book
          </FieldDescription>
        </Field>
      </Hook>
      <Hook name="field-error">
        <Field>
          <FieldLabel htmlFor="field-email">อีเมล / Email</FieldLabel>
          <Input id="field-email" defaultValue="kanya@" aria-invalid aria-describedby="field-email-error" />
          <FieldError id="field-email-error">รูปแบบอีเมลไม่ถูกต้อง / Invalid email</FieldError>
        </Field>
      </Hook>
    </div>
  )
}
