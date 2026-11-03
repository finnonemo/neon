// accordion, measured against CDS Accordion (fixtures/expansion/accordion.tsx):
// one item open at a time, the first open, and any item can close again.
import { Accordion as NeonAccordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Hook } from "../Hook"

export default function Accordion() {
  return (
    <div className="flex w-80 flex-col">
      <Hook name="accordion-default">
        <NeonAccordion type="single" collapsible defaultValue="fees">
          <AccordionItem value="fees">
            <AccordionTrigger>ค่าธรรมเนียม / Fees</AccordionTrigger>
            <AccordionContent><p>ไม่มีค่าธรรมเนียมการซื้อขาย / No trading fees</p></AccordionContent>
          </AccordionItem>
          <AccordionItem value="tax">
            <AccordionTrigger>ลดหย่อนภาษีกองทุน SSF และ RMF / Tax savings funds</AccordionTrigger>
            <AccordionContent><p>ลดหย่อนได้ตามเงื่อนไข / Deductible within limits</p></AccordionContent>
          </AccordionItem>
          <AccordionItem value="documents">
            <AccordionTrigger>เอกสาร / Documents</AccordionTrigger>
            <AccordionContent><p>หนังสือชี้ชวน / Prospectus</p></AccordionContent>
          </AccordionItem>
        </NeonAccordion>
      </Hook>
    </div>
  )
}
