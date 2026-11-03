// accordion's Counterpart, CDS Accordion: three items, the first open, a long
// Thai/English title among them. CDS draws a Divider between items and none
// after the last; the panel's content is the page's own body text.
import { Accordion as CdsAccordion, AccordionItem } from "@coinbase/cds-web/accordion";
import { VStack } from "@coinbase/cds-web/layout";
import { Text } from "@coinbase/cds-web/typography";
import { Hook } from "../Hook";

export default function Accordion() {
  return (
    <VStack width={320}>
      <Hook name="accordion-default">
        <CdsAccordion defaultActiveKey="fees">
          <AccordionItem itemKey="fees" title="ค่าธรรมเนียม / Fees">
            <Text as="p" font="body">ไม่มีค่าธรรมเนียมการซื้อขาย / No trading fees</Text>
          </AccordionItem>
          <AccordionItem itemKey="tax" title="ลดหย่อนภาษีกองทุน SSF และ RMF / Tax savings funds">
            <Text as="p" font="body">ลดหย่อนได้ตามเงื่อนไข / Deductible within limits</Text>
          </AccordionItem>
          <AccordionItem itemKey="documents" title="เอกสาร / Documents">
            <Text as="p" font="body">หนังสือชี้ชวน / Prospectus</Text>
          </AccordionItem>
        </CdsAccordion>
      </Hook>
    </VStack>
  );
}
