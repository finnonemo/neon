// button-group, measured against CDS ButtonGroup (fixtures/expansion/button-group.tsx):
// a horizontal group of a primary and a secondary button, and a vertical
// group whose buttons fill its width.
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Hook } from "../Hook"

export default function ButtonGroupSection() {
  return (
    <div className="flex w-80 flex-col gap-6">
      <Hook name="button-group-horizontal">
        <ButtonGroup aria-label="คำสั่ง / Actions">
          <Button>ซื้อ / Buy</Button>
          <Button variant="secondary">ขาย / Sell</Button>
        </ButtonGroup>
      </Hook>
      <Hook name="button-group-vertical">
        <div className="w-64">
          <ButtonGroup aria-label="ส่งออก / Export" orientation="vertical">
            <Button variant="secondary">ดาวน์โหลด / Download</Button>
            <Button variant="secondary">แชร์ / Share</Button>
          </ButtonGroup>
        </div>
      </Hook>
    </div>
  )
}
