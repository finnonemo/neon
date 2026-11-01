// The extras screen on the Neon base, measured against fixtures/Extras.tsx.
import { Button } from "@/components/ui/button"
import { Hook } from "./Hook"

export function Extras() {
  return (
    <main className="flex min-h-svh flex-col gap-6 p-6">
      <Hook name="title"><h1 className="text-title2">Extras</h1></Hook>
      <Hook name="actions">
        <div className="flex gap-2">
          <Button variant="destructive">ปฏิเสธคำขอ</Button>
          <Button variant="secondary">บันทึก</Button>
          <Button disabled>ส่งต่อ</Button>
        </div>
      </Hook>
    </main>
  )
}
