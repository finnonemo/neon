// collapsible, measured against CDS Collapsible (fixtures/expansion/collapsible.tsx):
// open below a secondary Button that Radix wires to the region it controls.
import { Button } from "@/components/ui/button"
import { Collapsible as NeonCollapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Hook } from "../Hook"

export default function Collapsible() {
  return (
    <div className="flex w-80 flex-col items-start">
      <Hook name="collapsible-default">
        <NeonCollapsible defaultOpen className="flex w-full flex-col items-start gap-6">
          <CollapsibleTrigger asChild>
            <Button variant="secondary">รายละเอียด / Details</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p>กองทุนนี้ลงทุนในหุ้นไทยขนาดใหญ่ / This fund invests in large Thai stocks</p>
          </CollapsibleContent>
        </NeonCollapsible>
      </Hook>
    </div>
  )
}
