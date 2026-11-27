// The money-move example (README.md beside this file): pattern P16, moving money as
// steps inside one sheet. Top up: pick the portfolio, pick how to pay (the recommended
// way first), a warning with one acknowledgement before the step that can lose money,
// then the details to pay to, with copy. Withdraw with nothing to withdraw opens the
// same sheet with why and the fix. Built from Neon registry items (sheet, button,
// list-row, checkbox, alert); all content is synthetic.
import { useState } from "react"
import { ArrowLeft, Building2, ChevronRight, Copy, Info, QrCode, TriangleAlert, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { List, ListRow, ListRowContent, ListRowDescription, ListRowTitle } from "@/components/ui/list-row"
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const ports = [{ id: "main", name: "พอร์ตหลัก", note: "เงินสดพร้อมลงทุน 0.00 บาท" }, { id: "tax", name: "พอร์ตลดหย่อนภาษี", note: "เงินสดพร้อมลงทุน 0.00 บาท" }]
const ways = [
  { id: "qr", icon: QrCode, name: "พร้อมเพย์ QR", note: "แนะนำ", time: "ภายใน 5 นาที" },
  { id: "bank", icon: Building2, name: "โอนผ่านธนาคาร", note: "", time: "ภายในวันทำการ" },
]
type Step = "port" | "way" | "warn" | "pay" | "empty"

export function MoneyMove() {
  const [open, setOpen] = useState(false), [step, setStep] = useState<Step>("port")
  const [port, setPort] = useState(ports[0]), [way, setWay] = useState(ways[0])
  const [skipWarn, setSkipWarn] = useState(false), [quiet, setQuiet] = useState(false), [copied, setCopied] = useState(false)
  const start = (s: Step) => { setStep(s); setCopied(false); setOpen(true) }
  const back: Partial<Record<Step, Step>> = { way: "port", warn: "way", pay: "way" }
  const title: Record<Step, string> = { port: "เติมเงินเข้าพอร์ตไหน", way: "เติมเงินด้วยวิธีไหน", warn: "ตรวจสอบก่อนโอน", pay: `เติมเงินเข้า${port.name}`, empty: "ยังไม่มีเงินให้ถอน" }

  return (
    <main className="flex flex-col gap-4 p-4">
      <h1 className="text-title3">เงินสดในพอร์ต</h1>
      <p className="text-title1 tabular-nums">0.00 <span className="text-body text-muted-foreground">บาท</span></p>
      <div className="flex gap-2">
        <Button onClick={() => start("port")}>เติมเงิน</Button>
        <Button variant="secondary" onClick={() => start("empty")}>ถอนเงิน</Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" aria-describedby={undefined}>
          <SheetHeader closeLabel="ปิด">
            <div className="flex items-center gap-2">
              {/* From the second step a back control sits before the title; closing stays on the sheet's own control. */}
              {back[step] && <Button variant="ghost" size="icon" aria-label="ย้อนกลับ" className="-ms-3" onClick={() => setStep(back[step]!)}><ArrowLeft /></Button>}
              <SheetTitle>{title[step]}</SheetTitle>
            </div>
            {step === "pay" && <SheetDescription>ด้วย{way.name}</SheetDescription>}
          </SheetHeader>

          {step === "port" && <SheetBody className="px-0 md:px-0">
            {/* A single choice advances on a tap: no Continue button. */}
            <List>{ports.map((p) => <ListRow key={p.id} onClick={() => { setPort(p); setStep("way") }}>
              <Wallet aria-hidden className="size-5 shrink-0 text-icon-muted" />
              <ListRowContent><ListRowTitle>{p.name}</ListRowTitle><ListRowDescription>{p.note}</ListRowDescription></ListRowContent>
              <ChevronRight aria-hidden className="size-5 text-icon-muted" />
            </ListRow>)}</List>
          </SheetBody>}

          {step === "way" && <SheetBody className="flex flex-col gap-4 px-0 md:px-0">
            <div className="px-6 md:px-8"><Alert><Info aria-hidden /><AlertTitle>ควรเลือกแบบไหน</AlertTitle><AlertDescription>พร้อมเพย์เข้าเร็วที่สุด โอนผ่านธนาคารใช้เมื่อยอดเกินวงเงินพร้อมเพย์ของคุณ</AlertDescription></Alert></div>
            <div className="flex justify-between px-6 text-legal text-muted-foreground md:px-8"><span>วิธีเติมเงิน</span><span>เงินเข้าพอร์ต</span></div>
            <List>{ways.map((w) => <ListRow key={w.id} onClick={() => { setWay(w); setStep(skipWarn ? "pay" : "warn") }}>
              <w.icon aria-hidden className="size-5 shrink-0 text-icon-muted" />
              <ListRowContent><ListRowTitle>{w.name}</ListRowTitle>{w.note && <ListRowDescription>{w.note}</ListRowDescription>}</ListRowContent>
              <span className="text-body text-muted-foreground">{w.time}</span>
            </ListRow>)}</List>
          </SheetBody>}

          {step === "warn" && <>
            <SheetBody className="flex flex-col items-center gap-4 py-6 text-center">
              <TriangleAlert aria-hidden className="size-12 text-warning" />
              <p className="text-body">โอนจากบัญชีธนาคารที่เป็นชื่อของคุณเท่านั้น เงินจากบัญชีชื่ออื่นจะถูกส่งคืนภายใน 7 วันทำการ และยังไม่ได้ลงทุน</p>
              <label className="flex min-h-11 items-center gap-3 text-body"><Checkbox checked={quiet} onCheckedChange={(c) => setQuiet(c === true)} />ไม่ต้องแสดงอีก</label>
            </SheetBody>
            <SheetFooter><Button className="w-full" onClick={() => { setSkipWarn(quiet); setStep("pay") }}>เข้าใจแล้ว</Button></SheetFooter>
          </>}

          {step === "pay" && <SheetBody className="flex flex-col gap-4 py-2">
            <dl className="flex flex-col gap-1">
              <dt className="text-legal text-muted-foreground">{way.id === "qr" ? "รหัสอ้างอิงพร้อมเพย์" : "เลขที่บัญชีรับโอน (ตัวอย่าง)"}</dt>
              <dd className="flex items-center justify-between gap-2">
                <span className="text-title4 tabular-nums">{way.id === "qr" ? "0-0000-00000-00-0" : "000-0-00000-0"}</span>
                <Button variant="secondary" size="sm" onClick={() => setCopied(true)}><Copy aria-hidden />คัดลอก</Button>
              </dd>
            </dl>
            {copied && <p role="status" className="text-legal text-muted-foreground">คัดลอกแล้ว</p>}
            <ul className="flex flex-col gap-3 pb-4 text-body">
              <li className="flex gap-3"><Info aria-hidden className="mt-0.5 size-5 shrink-0 text-icon-muted" />โอนจากบัญชีชื่อของคุณเท่านั้น</li>
              <li className="flex gap-3"><Info aria-hidden className="mt-0.5 size-5 shrink-0 text-icon-muted" />เงินเข้าพอร์ต{way.time}</li>
            </ul>
          </SheetBody>}

          {step === "empty" && <>
            <SheetBody className="py-4"><p className="text-body">พอร์ตนี้ยังไม่มีเงินสดให้ถอน เติมเงินเพื่อเริ่มลงทุน หรือขายกองทุนเพื่อรับเงินสด</p></SheetBody>
            <SheetFooter>
              <Button className="w-full" onClick={() => setStep("port")}>เติมเงิน</Button>
              <Button variant="secondary" className="w-full" onClick={() => setOpen(false)}>ไว้ทีหลัง</Button>
            </SheetFooter>
          </>}
        </SheetContent>
      </Sheet>
    </main>
  )
}
