// collapsible's Counterpart, CDS Collapsible, open below its trigger as in the
// CDS docs: the page's Button names the region it controls and says whether it
// is expanded. Collapsible adds no padding or color of its own.
import { useState } from "react";
import { Button } from "@coinbase/cds-web/buttons";
import { Collapsible as CdsCollapsible } from "@coinbase/cds-web/collapsible";
import { VStack } from "@coinbase/cds-web/layout";
import { Text } from "@coinbase/cds-web/typography";
import { Hook } from "../Hook";

export default function Collapsible() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <VStack gap={3} width={320} alignItems="flex-start">
      <Hook name="collapsible-default">
        <Button variant="secondary" aria-controls="collapsible-details" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
          รายละเอียด / Details
        </Button>
        <CdsCollapsible collapsed={collapsed} id="collapsible-details">
          <Text as="p" font="body">กองทุนนี้ลงทุนในหุ้นไทยขนาดใหญ่ / This fund invests in large Thai stocks</Text>
        </CdsCollapsible>
      </Hook>
    </VStack>
  );
}
