// The extras screen on the Neon base, measured against fixtures/Extras.tsx.
// It adds no provider: the base's AppRoot holds the tooltip provider and toaster.
import { useState } from "react"
import { InfoIcon, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { List, ListRow, ListRowContent, ListRowDescription, ListRowTitle } from "@/components/ui/list-row"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tag } from "@/components/ui/tag"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Hook } from "./Hook"
import { requests, statusLabel, types } from "./shared/data"

// Core's Checkbox in each Selection, Enabled then Disabled.
const checkboxes: [string, string, boolean | "indeterminate", boolean][] = [
  ["unchecked", "รับข่าวสาร / News", false, false],
  ["checked", "ยอมรับเงื่อนไข / Terms", true, false],
  ["indeterminate", "ทุกบัญชี / All accounts", "indeterminate", false],
  ["disabled-unchecked", "ส่งอีเมล / Email", false, true],
  ["disabled-checked", "ส่ง SMS / SMS", true, true],
  ["disabled-indeterminate", "ทุกช่องทาง / All channels", "indeterminate", true],
]

// Core's Pickers in October and November 2026: the suite's clock makes 15 October today.
const october = new Date(2026, 9, 1)
const november = new Date(2026, 10, 1)

export function Extras() {
  const [type, setType] = useState<string>()
  const [date, setDate] = useState<Date>()
  const [picked, setPicked] = useState<Date | undefined>(new Date(2026, 9, 10))
  const [range, setRange] = useState<DateRange | undefined>({ from: new Date(2026, 10, 17), to: new Date(2026, 10, 24) })
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
        {(["sm", "lg"] as const).map((size) => (
          <Hook key={size} name={`help-${size}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`ช่วยเหลือ ${size}`}><InfoIcon /></Button>
              </TooltipTrigger>
              <TooltipContent size={size}>มูลค่าทรัพย์สินสุทธิต่อหน่วย / Net asset value per unit</TooltipContent>
            </Tooltip>
          </Hook>
        ))}
        <Hook name="toast-action">
          <Button variant="secondary" size="sm" onClick={() => toast.success("ลบแล้ว / Removed", { action: { label: "เลิกทำ", onClick: () => {} } })}>ลบ</Button>
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
        {/* One line a cell, so a row is Core's minimum height at 375 too; the table scrolls sideways. */}
        <Table className="whitespace-nowrap">
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
      {/* Core's Segmented control Sizes, its Disabled control and its disabled segments, which CDS has no baseline for. */}
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
          <SegmentedControl data-segments="one-disabled" defaultValue="buy" aria-label="ประเภทคำสั่ง / Order type">
            <SegmentedControlItem value="buy" disabled>ซื้อ</SegmentedControlItem>
            <SegmentedControlItem value="sell" disabled>ขาย</SegmentedControlItem>
            <SegmentedControlItem value="switch">สับเปลี่ยน</SegmentedControlItem>
          </SegmentedControl>
        </div>
      </Hook>
      {/* Core's Checkbox Selections, Enabled and Disabled, which CDS has no baseline for. */}
      <Hook name="core-checkboxes">
        <div className="flex flex-wrap items-center gap-4">
          {checkboxes.map(([id, text, checked, disabled]) => (
            <div key={id} data-check={id} className="flex items-center gap-2">
              <Checkbox id={`check-${id}`} defaultChecked={checked} disabled={disabled} />
              <Label htmlFor={`check-${id}`} className="text-body text-foreground">{text}</Label>
            </div>
          ))}
        </div>
      </Hook>
      {/* Core's Pickers, which CDS has no baseline for: Mode Date with a Selected day, today and Disabled
          days; today Selected, in a calendar whose first month is this one; Mode Range. 16px from the screen's edges, as Core's Inline, so the grid fits at 375. */}
      <Hook name="core-calendar">
        <div className="-mx-2 flex flex-wrap items-start gap-6">
          <div data-calendar="date"><Calendar mode="single" selected={picked} onSelect={setPicked} defaultMonth={october} disabled={{ before: new Date(2026, 9, 5) }} /></div>
          <div data-calendar="today"><Calendar mode="single" selected={new Date(2026, 9, 15)} defaultMonth={october} startMonth={october} /></div>
          <div data-calendar="range"><Calendar mode="range" selected={range} onSelect={setRange} defaultMonth={november} /></div>
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
      {/* Core's Display tag cells the approval list has none of: Navy, and the Medium and Large Sizes. */}
      <Hook name="core-tags">
        <div className="flex flex-wrap items-center gap-2">
          <Tag>ฉบับร่าง</Tag>
          <Tag size="md" variant="positive">อนุมัติแล้ว</Tag>
          <Tag size="lg" variant="negative">ปฏิเสธ</Tag>
        </div>
      </Hook>
      {/* Core's List item states the approval list has none of: a disabled row (selected, for its Checkmark), and a row of one line. */}
      <Hook name="core-list">
        <List aria-label="บัญชี / Accounts">
          <ListRow disabled selected>
            <ListRowContent>
              <ListRowTitle>บัญชีออมทรัพย์</ListRowTitle>
              <ListRowDescription>ปิดใช้งาน</ListRowDescription>
            </ListRowContent>
          </ListRow>
          <ListRow>
            <ListRowContent><ListRowTitle>บัญชีกระแสรายวัน</ListRowTitle></ListRowContent>
          </ListRow>
        </List>
      </Hook>
      {/* Core's Menu parts the row menu has none of (a Section Title, a Separator, a disabled row), and a popover of its own content. */}
      <div className="flex flex-wrap gap-2">
        <Hook name="core-menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="secondary" size="md">จัดการ</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>คำขอ / Request</DropdownMenuLabel>
              <DropdownMenuItem>แก้ไข</DropdownMenuItem>
              <DropdownMenuItem disabled>ทำสำเนา</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">ลบ</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Hook>
        <Hook name="core-popover">
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary" size="md">เงื่อนไข</Button></PopoverTrigger>
            <PopoverContent align="start">คำขอที่เกิน 50,000 บาทต้องมีผู้อนุมัติสองคน / Requests over 50,000 THB need two approvers</PopoverContent>
          </Popover>
        </Hook>
      </div>
    </main>
  )
}
