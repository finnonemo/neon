// sheet, measured open on each side against CDS Tray (fixtures/expansion/sheet.tsx).
// Tray has no description, so neither has the sheet (aria-describedby is unset).
import { Button } from "@/components/ui/button"
import { Sheet as NeonSheet, SheetBody, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Hook } from "../Hook"

const sides = ["bottom", "top", "left", "right"] as const

export default function Sheet() {
  return (
    <div className="flex flex-wrap gap-2">
      {sides.map((side) => (
        <Hook key={side} name={`sheet-${side}`}>
          <NeonSheet>
            <SheetTrigger asChild><Button variant="secondary">{side}</Button></SheetTrigger>
            <SheetContent side={side} aria-describedby={undefined}>
              <SheetHeader closeLabel="ปิด / Close"><SheetTitle>ตัวกรอง / Filters</SheetTitle></SheetHeader>
              <SheetBody>
                <p>เลือกช่วงเวลาและสถานะของคำขอที่ต้องการดู / Choose the period and status of the requests to show.</p>
              </SheetBody>
            </SheetContent>
          </NeonSheet>
        </Hook>
      ))}
    </div>
  )
}
