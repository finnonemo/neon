// The order-form example (README.md beside this file): pattern P15, buy or sell an
// amount of one fund. It extends P4, a form with its summary in the Inspector:
// the side first, then where the money comes from, then the amount with what is
// available, then the summary and the one primary named by the side. Built from
// Neon registry items (button, field, input, segmented-control) in ContentLayout;
// the narrow dock is drawn here, not in the layout. All content is synthetic.
import { useState } from "react"
import { ArrowLeft, Building2 } from "lucide-react"
import { ContentLayout } from "@/layout/ContentLayout"
import { useBreakpointTier } from "@/layout/useBreakpointTier"
import { Button } from "@/components/ui/button"
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

const fund = { code: "SAMPLE-GEQ", nav: 14.2831, navDay: "20 พ.ย. 2569", feeBuy: 0.005 }
const cash = 12000, held = 1520.4317
const money = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const units = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 4, maximumFractionDigits: 4 })

type Side = "buy" | "sell"
type Unit = "baht" | "units"

export function OrderForm() {
  const compact = ["sm", "md"].includes(useBreakpointTier())
  const [side, setSide] = useState<Side>("buy"), [unit, setUnit] = useState<Unit>("baht")
  const [raw, setRaw] = useState(""), [pressed, setPressed] = useState(false), [sent, setSent] = useState(false)
  const [pane, setPane] = useState<"content" | "inspector">("content")

  const typed = Number(raw.replace(/,/g, "")) || 0
  // Selling may be in baht or units; buying is in baht. Everything below is in baht.
  const sellUnits = side === "sell" && unit === "units"
  const baht = sellUnits ? typed * fund.nav : typed
  const fee = side === "buy" ? baht * fund.feeBuy : 0
  const limit = side === "buy" ? cash : held * fund.nav
  const error = typed === 0 ? "ใส่จำนวน" : baht < 500 ? "ขั้นต่ำ 500 บาท" : baht + fee > limit ? (side === "buy" ? "ยอดเงินในบัญชีไม่พอ" : "มากกว่าหน่วยที่ถืออยู่") : null
  const total = side === "buy" ? baht + fee : baht
  const verb = side === "buy" ? "ซื้อ" : "ขาย"

  // The primary stays enabled; pressing it with an error shows the error on the field (Core).
  const submit = () => {
    setPressed(true)
    if (error) { setPane("content"); setTimeout(() => document.getElementById("amount")?.focus()); return }
    setSent(true)
  }
  const primary = <Button className="w-full" onClick={submit}>{verb}กองทุน</Button>
  const reset = () => { setRaw(""); setPressed(false); setSent(false) }

  const summary: [string, string][] = side === "buy"
    ? [["จำนวนเงิน", money(baht)], [`ค่าธรรมเนียมซื้อ ${fund.feeBuy * 100}%`, money(fee)], ["หน่วยที่คาดว่าได้", units(baht / fund.nav)], ["ราคา NAV", `${units(fund.nav)} (${fund.navDay})`]]
    : [["หน่วยที่ขาย", units(sellUnits ? typed : baht / fund.nav)], ["ราคา NAV", `${units(fund.nav)} (${fund.navDay})`], ["ค่าธรรมเนียมขาย", "ไม่มี"], ["เงินเข้าบัญชี", "2 วันทำการ"]]

  return (
    <ContentLayout
      sidebar={null} navigation={[]} activePane={pane} onActivePaneChange={setPane}
      paneLabels={{ content: `${verb}กองทุน`, inspector: "สรุปคำสั่ง", viewDetails: "สรุปคำสั่ง", backToContent: "กลับไปแก้คำสั่ง" }}
      contentHeader={<span className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={`กลับไป ${fund.code}`}><ArrowLeft /></Button>
        <h1 className="truncate text-title3">{verb} {fund.code}</h1>
      </span>}
      inspectorHeader={<span className="text-title3">สรุปคำสั่ง</span>}
      content={
        <div className="@container flex min-h-full flex-col">
          <div className="flex-1">
            <section className="flex flex-col gap-4 px-4 py-6">
              <SegmentedControl aria-label="ซื้อหรือขาย" value={side} onValueChange={(v) => { setSide(v as Side); setUnit("baht"); reset() }} className="max-w-[480px]">
                <SegmentedControlItem value="buy">ซื้อ</SegmentedControlItem>
                <SegmentedControlItem value="sell">ขาย</SegmentedControlItem>
              </SegmentedControl>
              <div className="flex min-h-18 items-center gap-3">
                <Building2 aria-hidden className="size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-headline">{side === "buy" ? "จ่ายจาก ออมทรัพย์ •• 4821" : "เงินเข้า ออมทรัพย์ •• 4821"}</p>
                  <p className="text-legal text-muted-foreground tabular-nums">{side === "buy" ? `ยอดที่ใช้ได้ ${money(cash)} บาท` : `ถืออยู่ ${units(held)} หน่วย · ${money(held * fund.nav)} บาท`}</p>
                </div>
                <Button variant="secondary" size="sm" aria-label="เปลี่ยนบัญชี">เปลี่ยน</Button>
              </div>
            </section>

            <section className="flex flex-col gap-4 border-t border-border px-4 py-6">
              {side === "sell" && <SegmentedControl size="sm" aria-label="หน่วยของจำนวน" value={unit} onValueChange={(v) => { setUnit(v as Unit); reset() }} className="max-w-[240px]">
                <SegmentedControlItem value="baht">บาท</SegmentedControlItem>
                <SegmentedControlItem value="units">หน่วย</SegmentedControlItem>
              </SegmentedControl>}
              <Field className="max-w-[480px]">
                <FieldLabel>{sellUnits ? "จำนวนหน่วย" : "จำนวนเงิน (บาท)"}</FieldLabel>
                <FieldControl><Input id="amount" inputMode="decimal" className="text-title4 tabular-nums" value={raw} onChange={(e) => { setRaw(e.target.value.replace(/[^\d.,]/g, "")); setSent(false) }} /></FieldControl>
                {pressed && error ? <FieldError>{error}</FieldError> : <FieldDescription>{sellUnits ? `≈ ${money(baht)} บาท` : "ขั้นต่ำ 500 บาท"}</FieldDescription>}
              </Field>
              {/* Too little money: the way to fix it sits with the error, in place. */}
              {pressed && error && side === "buy" && baht + fee > cash && <p className="text-body">ต้องการเงินเพิ่ม? <Button variant="link" className="h-auto px-0">โอนเงินเข้าบัญชี</Button></p>}
              <div className="flex flex-wrap gap-2" role="group" aria-label="จำนวนที่ใช้บ่อย">
                {(side === "buy" ? [["1,000", "1000"], ["5,000", "5000"], ["10,000", "10000"]] : [["ครึ่งหนึ่ง", String(sellUnits ? held / 2 : (held * fund.nav) / 2)], ["ทั้งหมด", String(sellUnits ? held : held * fund.nav)]]).map(([l, v]) =>
                  <Button key={l} variant="secondary" size="sm" onClick={() => { setRaw(sellUnits ? units(Number(v)) : money(Number(v))); setSent(false) }}>{l}</Button>)}
              </div>
            </section>
            {sent && <p role="status" className="px-4 pb-6 text-body">ส่งคำสั่ง{verb}แล้ว · ตัวอย่าง</p>}
          </div>
          {/* Narrow: the total sits over the one primary in a dock fixed to the bottom; the tab bar is not shown on this screen. */}
          {compact && <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-background p-4">
            <div className="flex justify-between text-headline"><span>{side === "buy" ? "หักจากบัญชี" : "ได้รับประมาณ"}</span><span className="tabular-nums">{money(total)} บาท</span></div>
            {primary}
          </div>}
        </div>
      }
      inspector={
        <div className="flex flex-col gap-6 px-4 py-6">
          {primary}
          <section className="flex flex-col gap-4">
            <div><p className="text-headline">{fund.code}</p><p className="text-legal text-muted-foreground">{verb} · ส่งก่อน 15:30 น. ได้ราคาสิ้นวันนี้</p></div>
            <dl className="flex flex-col gap-2 text-body">{summary.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right tabular-nums">{v}</dd></div>)}</dl>
          </section>
          <div className="flex justify-between border-t border-border pt-4 text-title4"><span>{side === "buy" ? "หักจากบัญชี" : "ได้รับประมาณ"}</span><span aria-live="polite" className="tabular-nums">{money(total)}</span></div>
          <p className="text-legal text-muted-foreground">หน่วยและเงินจริงคิดจาก NAV ที่ประกาศสิ้นวัน ข้อมูลตัวอย่าง</p>
        </div>
      }
    />
  )
}
