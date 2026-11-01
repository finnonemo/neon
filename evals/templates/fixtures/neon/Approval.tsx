// The approval screen on the Neon base, measured against fixtures/Approval.tsx.
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { requests } from "./shared/data"
import { Hook } from "./Hook"

export function Approval() {
  const current = requests[0]
  return (
    <main className="flex flex-col gap-6 p-6">
      <Hook name="title"><h1 className="text-title2">คำขออนุมัติ</h1></Hook>
      <Hook name="summary">
        <div className="flex flex-col gap-1">
          <h2 className="text-title3">{current.name}</h2>
          <span className="text-body text-muted-foreground">{current.type} · {current.amount}</span>
        </div>
      </Hook>
      <Hook name="details">
        <div className="flex flex-col gap-2">
          <span className="text-headline">รายละเอียด / Details</span>
          <span className="text-body">{current.note}</span>
          <span className="text-label2 text-muted-foreground">ส่งเมื่อ {current.submitted}</span>
        </div>
      </Hook>
      <Hook name="actions">
        <div className="flex gap-2">
          <Button>อนุมัติ / Approve</Button>
          <Button variant="secondary">ขอข้อมูลเพิ่ม</Button>
          <Button variant="destructive">ปฏิเสธ</Button>
        </div>
      </Hook>
      {/* cn must keep a type role and a text color together (lib/utils.ts). */}
      <span data-measure="role-and-color" className={cn("text-label1", "text-positive")}>อนุมัติแล้ว</span>
    </main>
  )
}
