// The approval screen on the Neon base, measured against fixtures/Approval.tsx.
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { List, ListRow, ListRowContent, ListRowDescription, ListRowTitle } from "@/components/ui/list-row"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Tag } from "@/components/ui/tag"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { requests, statusLabel, type Status } from "./shared/data"
import { Hook } from "./Hook"

const tagVariant: Record<Status, "warning" | "positive" | "negative"> = { pending: "warning", approved: "positive", rejected: "negative" }
const initial = (name: string) => name.charAt(0)

export function Approval() {
  const [tab, setTab] = useState("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(requests[0].id)
  const [confirmed, setConfirmed] = useState(true)
  const visible = requests.filter((r) => (tab === "all" || r.status === tab) && r.name.toLowerCase().includes(query.toLowerCase()))
  const current = requests.find((r) => r.id === selected)!

  return (
    <main className="flex flex-col gap-6 p-6">
      <Hook name="title"><h1 className="text-title2">คำขออนุมัติ</h1></Hook>
      <Hook name="search">
        <div className="flex flex-col gap-1">
          <Label htmlFor="search">ค้นหา / Search</Label>
          <Input id="search" placeholder="ชื่อผู้ขอ" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Hook>
      <Hook name="segmented">
        <SegmentedControl aria-label="สถานะ / Status" value={tab} onValueChange={setTab}>
          <SegmentedControlItem value="all">ทั้งหมด</SegmentedControlItem>
          <SegmentedControlItem value="pending">รอ</SegmentedControlItem>
          <SegmentedControlItem value="approved">อนุมัติ</SegmentedControlItem>
        </SegmentedControl>
      </Hook>
      <Hook name="list">
        <List aria-label="คำขอ / Requests">
          {visible.map((r) => (
            <ListRow key={r.id} selected={r.id === selected} onClick={() => setSelected(r.id)}>
              <Avatar><AvatarFallback>{initial(r.name)}</AvatarFallback></Avatar>
              <ListRowContent>
                <ListRowTitle>{r.name}</ListRowTitle>
                <ListRowDescription>{r.type}</ListRowDescription>
              </ListRowContent>
              <Tag variant={tagVariant[r.status]}>{statusLabel[r.status]}</Tag>
            </ListRow>
          ))}
        </List>
      </Hook>
      <Hook name="summary">
        <div className="flex items-center gap-4">
          <Avatar size="lg"><AvatarFallback>{initial(current.name)}</AvatarFallback></Avatar>
          <div className="flex flex-col gap-1">
            <h2 className="text-title3">{current.name}</h2>
            <span className="text-body text-muted-foreground">{current.type} · {current.amount}</span>
          </div>
          <Tag variant={tagVariant[current.status]} className="ml-auto">{statusLabel[current.status]}</Tag>
        </div>
      </Hook>
      <Hook name="details">
        <div className="flex flex-col gap-2">
          <span className="text-headline">รายละเอียด / Details</span>
          <span className="text-body">{current.note}</span>
          <span className="text-label2 text-muted-foreground">ส่งเมื่อ {current.submitted}</span>
        </div>
      </Hook>
      <Hook name="notes">
        <div className="flex flex-col gap-1">
          <Label htmlFor="notes">บันทึก / Notes</Label>
          <Textarea id="notes" placeholder="เหตุผลประกอบการพิจารณา" />
        </div>
      </Hook>
      <Hook name="confirm">
        <div className="flex items-center gap-2">
          <Checkbox id="confirm" checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} />
          <Label htmlFor="confirm" className="text-body text-foreground">ตรวจสอบเอกสารครบแล้ว</Label>
        </div>
      </Hook>
      <Hook name="actions">
        <div className="flex gap-2">
          <Button disabled={!confirmed}>อนุมัติ / Approve</Button>
          <Button variant="secondary">ขอข้อมูลเพิ่ม</Button>
          <Button variant="destructive">ปฏิเสธ</Button>
        </div>
      </Hook>
      {/* cn must keep a type role and a text color together (lib/utils.ts). */}
      <span data-measure="role-and-color" className={cn("text-label1", "text-positive")}>อนุมัติแล้ว</span>
    </main>
  )
}
