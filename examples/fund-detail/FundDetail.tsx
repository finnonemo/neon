// The fund-detail example (README.md beside this file): pattern P14, an item page
// with a live chart, for "Item page" in skills/neon-audit/references/page-anatomy.md.
// Content answers how the fund is doing; the Inspector holds what to do about it.
// Built from Neon registry items (button, segmented-control, list-row) inside
// ContentLayout, with the chart drawn in SVG. All content is synthetic sample data.
import { useState } from "react"
import { ArrowLeft, ChevronRight, ArrowLeftRight, Repeat, Star } from "lucide-react"
import { ContentLayout } from "@/layout/ContentLayout"
import { useBreakpointTier } from "@/layout/useBreakpointTier"
import type { NavItem } from "@/layout/navItems"
import { Button } from "@/components/ui/button"
import { List, ListRow, ListRowContent, ListRowDescription, ListRowTitle } from "@/components/ui/list-row"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { LineChart, day, series, type Point } from "./LineChart"

const baht = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${baht(Math.abs(n))}`
const pct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n * 100).toFixed(2)}%`
const tone = (n: number) => (n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted-foreground")

const fund = { code: "SAMPLE-GEQ", name: "กองทุนตัวอย่างหุ้นโลก", nav: 14.2831 }
const ranges = [["1M", 30], ["3M", 90], ["6M", 180], ["1Y", 365], ["3Y", 1095]] as const
const facts: [string, string][] = [
  ["ระดับความเสี่ยง", "6 · สูง"], ["ค่าธรรมเนียมรวม", "1.12% ต่อปี"], ["ขนาดกองทุน", "12,450 ล้านบาท"],
  ["วันจดทะเบียน", "4 มี.ค. 2562"], ["นโยบายปันผล", "ไม่จ่าย"], ["ซื้อขั้นต่ำ", "500 บาท"],
]
const similar = [
  { code: "SAMPLE-USEQ", note: "หุ้นสหรัฐ · เสี่ยง 6", ret: 0.1421 },
  { code: "SAMPLE-ASIA", note: "หุ้นเอเชีย · เสี่ยง 6", ret: 0.0612 },
  { code: "SAMPLE-TECH", note: "หุ้นเทคโนโลยี · เสี่ยง 7", ret: -0.0234 },
]

export function FundDetail({ navigation }: { navigation: NavItem[] }) {
  const tier = useBreakpointTier(), compact = tier === "sm" || tier === "md"
  const [days, setDays] = useState("180"), [point, setPoint] = useState<Point | null>(null)
  const data = series(Number(days), fund.nav, 0.09)
  // The figure is the chart's read-out: it shows the day under the pointer or the
  // keyboard, and its change from the first day of the range.
  const value = point?.value ?? fund.nav, change = value - data[0].value
  const buy = <Button className={compact ? "" : "w-full"} size={compact ? "sm" : "default"}>ซื้อกองทุนนี้</Button>

  return (
    <ContentLayout
      sidebar={null} navigation={navigation}
      paneLabels={{ content: fund.code, inspector: "ทำรายการ", viewDetails: "เพิ่มเติม", backToContent: `กลับไป ${fund.code}` }}
      contentHeader={<span className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="กลับไปรายการกองทุน"><ArrowLeft /></Button>
        <h1 className="truncate text-title3">{fund.code}</h1>
      </span>}
      // Narrow: the Inspector is a separate view, so its one primary stays in the title row.
      contentActions={compact && buy}
      inspectorHeader={<span className="text-title3">ทำรายการ</span>}
      content={
        <div className="@container">
          <section aria-label="มูลค่าหน่วยลงทุน">
            <div className="px-4 pt-6 pb-4">
              <p className="flex items-center justify-between gap-2 pb-2">
                <span className="text-headline">{fund.name}</span>
                <Button variant="ghost" size="icon" aria-label="ติดตามกองทุน" aria-pressed={false}><Star /></Button>
              </p>
              <p className="text-body text-muted-foreground">{point ? `NAV ณ ${day(point.date)} (บาท)` : "NAV ล่าสุด (บาท)"}</p>
              <p className="text-title1 tabular-nums">{baht(value)}</p>
              <p className={`text-body tabular-nums ${tone(change)}`}>
                {signed(change)} ({pct(change / data[0].value)}) <span className="text-muted-foreground">ตั้งแต่ {day(data[0].date)}</span>
              </p>
            </div>
            <LineChart data={data} label={`NAV ${fund.code}`} format={baht} onRead={setPoint} />
            <div className="px-4 pt-2 pb-6">
              <SegmentedControl size="sm" aria-label="ช่วงเวลา" value={days} onValueChange={(v) => { setDays(v); setPoint(null) }} className="max-w-[480px]">
                {ranges.map(([l, d]) => <SegmentedControlItem key={d} value={String(d)}>{l}</SegmentedControlItem>)}
              </SegmentedControl>
            </div>
          </section>

          <section aria-labelledby="about" className="border-t border-border px-4 py-6">
            <h2 id="about" className="pb-2 text-title4">เกี่ยวกับกองทุน</h2>
            <p className="text-body">ลงทุนในหุ้นของบริษัทขนาดใหญ่ทั่วโลกผ่านกองทุนหลัก เน้นการเติบโตระยะยาว เหมาะกับผู้ที่รับความผันผวนได้และลงทุนได้ตั้งแต่ 5 ปีขึ้นไป</p>
            <Button variant="link" className="h-auto px-0">อ่านหนังสือชี้ชวน</Button>
          </section>

          <section aria-labelledby="facts" className="border-t border-border py-6">
            <h2 id="facts" className="px-4 pb-4 text-title4">ข้อมูลกองทุน</h2>
            {/* Label over value: two columns, three once the pane has room. */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-4 @min-[560px]:grid-cols-3">
              {facts.map(([k, v]) => <div key={k} className="flex flex-col gap-1"><dt className="text-legal text-muted-foreground">{k}</dt><dd className="text-headline tabular-nums">{v}</dd></div>)}
            </dl>
          </section>

          <section aria-labelledby="similar" className="border-t border-border py-6">
            <h2 id="similar" className="px-4 pb-2 text-title4">กองทุนที่คล้ายกัน</h2>
            <List>
              {similar.map((f) => <ListRow key={f.code}>
                <ListRowContent><ListRowTitle>{f.code}</ListRowTitle><ListRowDescription>{f.note}</ListRowDescription></ListRowContent>
                <span className={`text-body tabular-nums ${tone(f.ret)}`}>{pct(f.ret)} <span className="text-legal text-muted-foreground">1 ปี</span></span>
                <ChevronRight aria-hidden className="size-5 text-icon-muted" />
              </ListRow>)}
            </List>
            <div className="px-4 pt-4"><Button variant="secondary" size="md" className="w-full">ดูกองทุนหุ้นโลกทั้งหมด</Button></div>
          </section>

          <p className="border-t border-border px-4 py-6 text-legal text-muted-foreground">
            ผลการดำเนินงานในอดีตไม่ได้เป็นสิ่งยืนยันผลในอนาคต ผู้ลงทุนควรศึกษาข้อมูลในหนังสือชี้ชวนก่อนตัดสินใจลงทุน ข้อมูลในหน้านี้เป็นตัวอย่าง
          </p>
        </div>
      }
      inspector={
        <div className="flex flex-col">
          <div className="flex flex-col gap-4 px-4 py-6">
            <p className="text-body text-muted-foreground">ซื้อขั้นต่ำ 500 บาท · ได้ราคา NAV ของวันทำการถัดไป</p>
            {compact ? <Button className="w-full">ซื้อกองทุนนี้</Button> : buy}
          </div>
          <List className="border-t border-border py-2">
            {([[ArrowLeftRight, "ขายหรือสับเปลี่ยน", "ยังไม่ได้ถือกองทุนนี้"], [Repeat, "ลงทุนทุกเดือน", "ตั้งวันและจำนวนเงิน"]] as const).map(([I, t, d]) =>
              <ListRow key={t}><I aria-hidden className="size-5 shrink-0 text-icon-muted" /><ListRowContent><ListRowTitle>{t}</ListRowTitle><ListRowDescription>{d}</ListRowDescription></ListRowContent><ChevronRight aria-hidden className="size-5 text-icon-muted" /></ListRow>)}
          </List>
        </div>
      }
    />
  )
}
