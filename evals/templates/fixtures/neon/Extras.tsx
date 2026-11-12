// The extras screen on the Neon base, measured against fixtures/Extras.tsx.
// It adds no provider: the base's AppRoot holds the tooltip provider and toaster.
import { useState } from "react"
import { InfoIcon, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Hook } from "./Hook"
import { requests, statusLabel, types } from "./shared/data"

export function Extras() {
  const [type, setType] = useState<string>()
  const [date, setDate] = useState<Date>()
  const [sending, setSending] = useState(false)
  return (
    <main className="flex min-h-svh flex-col gap-6 p-6">
      <Hook name="title"><h1 className="text-title2">Extras</h1></Hook>
      <div className="flex flex-wrap items-end gap-4">
        <Hook name="select">
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="type">ประเภท / Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
              <SelectContent>
                {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Hook>
        <Hook name="date">
          <div className="flex w-64 flex-col gap-2">
            <Label htmlFor="submitted">วันที่ส่ง / Submitted</Label>
            <DatePicker id="submitted" value={date} onChange={setDate} />
          </div>
        </Hook>
        <Hook name="help">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="ช่วยเหลือ"><InfoIcon /></Button>
            </TooltipTrigger>
            <TooltipContent>ช่วยเหลือ / Help</TooltipContent>
          </Tooltip>
        </Hook>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Hook name="disabled-field">
          <div className="flex w-64 flex-col gap-2">
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
      <Hook name="table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead className="text-right">จำนวนเงิน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead><span className="sr-only">ตัวเลือก</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.slice(0, 5).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell className="text-right">{r.amount}</TableCell>
                <TableCell>{statusLabel[r.status]}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`ตัวเลือก ${r.name}`}><MoreHorizontalIcon /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>ดูรายละเอียด</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">ปฏิเสธ</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Hook>
      <Hook name="actions">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="destructive">ปฏิเสธคำขอ</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader closeLabel="ปิด"><DialogTitle>ยืนยันการปฏิเสธ</DialogTitle></DialogHeader>
              <DialogBody><DialogDescription>คำขอนี้จะถูกส่งกลับไปยังผู้ขอ</DialogDescription></DialogBody>
              <DialogFooter>
                <DialogClose asChild><Button variant="secondary">ยกเลิก</Button></DialogClose>
                <Button variant="destructive">ยืนยัน</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="secondary" onClick={() => toast("บันทึกแล้ว / Saved")}>บันทึก</Button>
          <Button disabled>ส่งต่อ</Button>
        </div>
      </Hook>
      {/* Core's field states CDS has no baseline for. */}
      <Hook name="core-fields">
        <div className="flex flex-wrap items-start gap-4">
          <div data-field="read-only" className="flex w-64 flex-col gap-2">
            <Label htmlFor="account">เลขที่บัญชี / Account</Label>
            <Input id="account" readOnly defaultValue="123-4-56789-0" />
          </div>
          <div data-field="invalid" className="flex w-64 flex-col gap-2">
            <Label htmlFor="email">อีเมล / Email</Label>
            <Input id="email" aria-invalid defaultValue="kanya@" />
          </div>
          <div data-field="placeholder" className="flex w-64 flex-col gap-2">
            <Label htmlFor="branch">สาขา / Branch</Label>
            <Input id="branch" placeholder="ชื่อสาขา" />
          </div>
          <div data-field="disabled" data-disabled="true" className="group flex w-64 flex-col gap-2">
            <Label htmlFor="team">ทีม / Team</Label>
            <Input id="team" disabled defaultValue="Operations" />
          </div>
          <div data-field="invalid-textarea" className="flex w-64 flex-col gap-2">
            <Label htmlFor="reason">เหตุผล / Reason</Label>
            <Textarea id="reason" aria-invalid defaultValue="สั้นเกินไป" />
          </div>
          <div data-field="disabled-textarea" data-disabled="true" className="group flex w-64 flex-col gap-2">
            <Label htmlFor="remark">หมายเหตุ / Remark</Label>
            <Textarea id="remark" disabled defaultValue="ปิดรับแล้ว" />
          </div>
          <div data-field="invalid-select" className="flex w-64 flex-col gap-2">
            <Label htmlFor="channel">ช่องทาง / Channel</Label>
            <Select defaultValue={types[0]}>
              <SelectTrigger id="channel" aria-invalid><SelectValue /></SelectTrigger>
              <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div data-field="disabled-select" data-disabled="true" className="group flex w-64 flex-col gap-2">
            <Label htmlFor="region">ภูมิภาค / Region</Label>
            <Select defaultValue={types[0]} disabled>
              <SelectTrigger id="region"><SelectValue /></SelectTrigger>
              <SelectContent>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </Hook>
      {/* Core's Segmented control Sizes and its Disabled control, which CDS has no baseline for. */}
      <Hook name="core-segments">
        <div className="flex w-80 flex-col gap-4">
          <SegmentedControl data-segments="sm" size="sm" defaultValue="week" aria-label="ช่วงเวลา / Period">
            <SegmentedControlItem value="day">วัน</SegmentedControlItem>
            <SegmentedControlItem value="week">สัปดาห์</SegmentedControlItem>
            <SegmentedControlItem value="month">เดือน</SegmentedControlItem>
          </SegmentedControl>
          <SegmentedControl data-segments="lg" size="lg" defaultValue="list" aria-label="มุมมอง / View">
            <SegmentedControlItem value="list">รายการ</SegmentedControlItem>
            <SegmentedControlItem value="grid">ตาราง</SegmentedControlItem>
          </SegmentedControl>
          <SegmentedControl data-segments="disabled" disabled defaultValue="buy" aria-label="คำสั่ง / Order">
            <SegmentedControlItem value="buy">ซื้อ</SegmentedControlItem>
            <SegmentedControlItem value="sell">ขาย</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </Hook>
      {/* Core's Button values CDS has no baseline for; Inverse sits on the inverse background. */}
      <Hook name="core-buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="md">ส่งคำขอ</Button>
          <Button size="xs" variant="secondary">แก้ไข</Button>
          <Button size="sm" variant="ghost">ข้าม</Button>
          <Button variant="brand">สมัครเลย</Button>
          <Button loading>กำลังบันทึก</Button>
          <Button variant="secondary" loading={sending} onClick={() => { setSending(true); toast("ส่งแล้ว / Sent") }}>ส่งรายงาน</Button>
          <div className="rounded-lg bg-inverse p-4"><Button variant="inverse">ดูเพิ่มเติม</Button></div>
        </div>
      </Hook>
    </main>
  )
}
