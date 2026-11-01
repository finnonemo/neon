// The extras screen on the Neon base, measured against fixtures/Extras.tsx.
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hook } from "./Hook"

export function Extras() {
  return (
    <main className="flex min-h-svh flex-col gap-6 p-6">
      <Hook name="title"><h1 className="text-title2">Extras</h1></Hook>
      <div className="flex flex-wrap items-center gap-4">
        <Hook name="disabled-field">
          <div className="flex w-64 flex-col gap-1">
            <Label htmlFor="approver">ผู้อนุมัติ / Approver</Label>
            <Input id="approver" value="Kanya Srisuk" disabled readOnly />
          </div>
        </Hook>
        <Hook name="disabled-check">
          <div className="flex items-center gap-2">
            <Checkbox id="notify" checked disabled />
            <Label htmlFor="notify" className="text-body text-foreground">แจ้งผู้ขอ</Label>
          </div>
        </Hook>
      </div>
      <Hook name="actions">
        <div className="flex flex-wrap gap-2">
          <Button variant="destructive">ปฏิเสธคำขอ</Button>
          <Button variant="secondary">บันทึก</Button>
          <Button disabled>ส่งต่อ</Button>
        </div>
      </Hook>
    </main>
  )
}
