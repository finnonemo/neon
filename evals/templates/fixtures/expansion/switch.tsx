// switch's Counterpart, CDS Switch, labelled, in each state: off, on, and
// disabled off and on. The stack sets the gaps between them.
import { useState } from "react";
import { Switch as CdsSwitch } from "@coinbase/cds-web/controls";
import { VStack } from "@coinbase/cds-web/layout";
import { Hook } from "../Hook";

export default function Switch() {
  const [off, setOff] = useState(false);
  const [on, setOn] = useState(true);
  return (
    <VStack gap={2} width={256}>
      <Hook name="switch-off"><CdsSwitch checked={off} onChange={() => setOff(!off)}>แจ้งเตือน / Alerts</CdsSwitch></Hook>
      <Hook name="switch-on"><CdsSwitch checked={on} onChange={() => setOn(!on)}>สแกนนิ้ว / Touch ID</CdsSwitch></Hook>
      <Hook name="switch-disabled-off"><CdsSwitch checked={false} disabled onChange={() => {}}>ล็อกไว้ / Locked</CdsSwitch></Hook>
      <Hook name="switch-disabled-on"><CdsSwitch checked disabled onChange={() => {}}>ยืนยันตัวตน / Verified</CdsSwitch></Hook>
    </VStack>
  );
}
