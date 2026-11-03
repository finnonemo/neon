// radio-group's Counterpart, CDS RadioGroup: a headline label over its options,
// one checked. RadioGroup takes its options as value → label only, so it cannot
// disable one; the disabled group is ControlGroup with role="radiogroup", which
// RadioGroup wraps (and which CDS names as its replacement), with the same Radio.
import { useState, type ComponentProps } from "react";
import { ControlGroup, Radio, RadioGroup as CdsRadioGroup } from "@coinbase/cds-web/controls";
import { VStack } from "@coinbase/cds-web/layout";
import { Hook } from "../Hook";

export default function RadioGroup() {
  const [payout, setPayout] = useState("bank");
  return (
    <VStack gap={3} width={256}>
      <Hook name="radio-group-enabled">
        <CdsRadioGroup
          label="บัญชีรับเงิน / Payout"
          name="payout"
          value={payout}
          onChange={setPayout}
          options={{ bank: "ธนาคาร / Bank", wallet: "วอลเล็ต / Wallet", card: "บัตร / Card" }}
        />
      </Hook>
      <Hook name="radio-group-disabled">
        <ControlGroup<string, ComponentProps<typeof Radio>>
          role="radiogroup"
          label="รอบการลงทุน / Frequency"
          name="frequency"
          ControlComponent={Radio}
          value="monthly"
          onChange={() => {}}
          options={[
            { value: "monthly", children: "รายเดือน / Monthly", disabled: true },
            { value: "weekly", children: "รายสัปดาห์ / Weekly", disabled: true },
          ]}
        />
      </Hook>
    </VStack>
  );
}
