// tabs's Counterpart, CDS Tabs with its default underline look (DefaultTab and
// DefaultTabsActiveIndicator), spaced gap={4} as every CDS Tabs example is:
// an active tab, an inactive one and a disabled one. CDS renders no tab panels;
// the page pairs the active tab with a role=tabpanel, as the CDS docs ask.
import { useState } from "react";
import { Box, VStack } from "@coinbase/cds-web/layout";
import { Tabs as CdsTabs } from "@coinbase/cds-web/tabs";
import { Text } from "@coinbase/cds-web/typography";
import { Hook } from "../Hook";

const tabs = [
  { id: "overview", label: "ภาพรวม" },
  { id: "history", label: "History" },
  { id: "documents", label: "เอกสาร", disabled: true },
];

export default function Tabs() {
  const [active, setActive] = useState<(typeof tabs)[number] | null>(tabs[0]);
  return (
    <VStack gap={1} width={320}>
      <Hook name="tabs-default">
        <CdsTabs accessibilityLabel="บัญชี / Account" activeTab={active} gap={4} onChange={setActive} tabs={tabs} testID="tabs" />
        <Box role="tabpanel" id={`tabpanel--${active?.id}`} aria-labelledby={`tab--${active?.id}`}>
          <Text as="p" font="body">ยอดคงเหลือและรายการล่าสุด / Balance and recent activity</Text>
        </Box>
      </Hook>
    </VStack>
  );
}
