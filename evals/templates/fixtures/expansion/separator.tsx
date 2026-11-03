// separator's Counterpart, CDS Divider, in both directions. Divider adds no
// spacing of its own: the stacks set the gaps either side of the line.
import { Divider, HStack, VStack } from "@coinbase/cds-web/layout";
import { Text } from "@coinbase/cds-web/typography";
import { Hook } from "../Hook";

export default function Separator() {
  return (
    <VStack gap={2} width={256}>
      <Hook name="separator-horizontal">
        <VStack gap={1}>
          <Text as="p" font="body">ยอดคงเหลือ / Balance</Text>
          <Divider />
          <Text as="p" font="body">ค่าธรรมเนียม / Fees</Text>
        </VStack>
      </Hook>
      <Hook name="separator-vertical">
        <HStack gap={1} alignItems="center" height={24}>
          <Text as="p" font="label2">บัญชี / Account</Text>
          <Divider direction="vertical" />
          <Text as="p" font="label2">ประวัติ / History</Text>
        </HStack>
      </Hook>
    </VStack>
  );
}
