// The pane-grids example (README.md beside this file): the three grids that
// "Grids inside a pane" in skills/neon-audit/references/functional-patterns.md
// names, for a functional pane's content. Built from Neon registry items
// (card, field, input) and Tailwind; all content is synthetic. Neon's browser
// suite renders this file in AppShell and ContentLayout at every breakpoint.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldControl, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const funds = [
  { name: "Global Equity Index", note: "หุ้นทั่วโลก / Global equity" },
  { name: "Thai Fixed Income", note: "ตราสารหนี้ไทย / Thai bonds" },
  { name: "Asia Technology", note: "หุ้นเทคโนโลยีเอเชีย / Asian tech" },
  { name: "Money Market Plus", note: "ตลาดเงิน / Money market" },
  { name: "Balanced Income", note: "ผสม / Mixed allocation" },
  { name: "Healthcare Leaders", note: "หุ้นสุขภาพ / Healthcare" },
  { name: "Gold Tracker", note: "ทองคำ / Gold" },
]

const figures = [
  { label: "มูลค่ารวม / Total value", value: "1,250,000.00" },
  { label: "กำไร / Gain", value: "+42,310.55" },
  { label: "เงินสด / Cash", value: "18,000.00" },
  { label: "คำสั่งรอดำเนินการ / Pending orders", value: "3" },
]

const fields = ["ชื่อ / First name", "นามสกุล / Last name", "อีเมล / Email", "เบอร์โทร / Phone"]

export function PaneGrids() {
  return <div className="@container flex flex-col gap-8 p-4">
    <section aria-labelledby="figures" className="flex flex-col gap-4">
      <h2 id="figures" className="text-headline">ภาพรวม / Overview</h2>
      {/* A row of figures wraps as a flex row: each keeps its own width. */}
      <dl data-example="figures" className="flex flex-wrap gap-x-8 gap-y-4">
        {figures.map((f) => <div key={f.label} className="flex flex-col gap-1">
          <dt className="text-label2 text-muted-foreground">{f.label}</dt>
          <dd className="text-title3 tabular-nums">{f.value}</dd>
        </div>)}
      </dl>
    </section>

    <section aria-labelledby="tiles" className="flex flex-col gap-4">
      <h2 id="tiles" className="text-headline">กองทุนแนะนำ / Featured funds</h2>
      {/* Tiles of no fixed count: auto-fill wraps them at every pane width, with no breakpoint. */}
      <ul data-example="tiles" className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
        {funds.map((f) => <li key={f.name}>
          <Card><CardHeader><CardTitle>{f.name}</CardTitle><CardDescription>{f.note}</CardDescription></CardHeader>
            <CardContent className="text-label2 text-muted-foreground">ตัวอย่าง / Sample</CardContent></Card>
        </li>)}
      </ul>
    </section>

    <section aria-labelledby="form" className="flex flex-col gap-4">
      <h2 id="form" className="text-headline">ข้อมูลผู้ติดต่อ / Contact details</h2>
      {/* A fixed count that changes: two columns once the pane, not the viewport, is 480px wide. */}
      <div data-example="form" className="grid gap-4 @min-[480px]:grid-cols-2">
        {fields.map((label) => <Field key={label}>
          <FieldLabel>{label}</FieldLabel>
          <FieldControl><Input /></FieldControl>
        </Field>)}
      </div>
    </section>
  </div>
}
