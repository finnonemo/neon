// progress's Counterpart, CDS ProgressBar at its default (normal) weight: a
// 4px bgLine track with a bgPrimary fill, both fully rounded. The fill skips
// its mount animation, so it is measured where it rests.
import { VStack } from "@coinbase/cds-web/layout";
import { Text } from "@coinbase/cds-web/typography";
import { ProgressBar } from "@coinbase/cds-web/visualizations";
import { Hook } from "../Hook";

export default function Progress() {
  return (
    <Hook name="progress-default">
      <VStack gap={1} width={256}>
        <Text as="p" font="label2">อัปโหลดเอกสาร / Uploading documents</Text>
        <ProgressBar progress={0.6} disableAnimateOnMount accessibilityLabel="อัปโหลดเอกสาร / Uploading documents" />
      </VStack>
    </Hook>
  );
}
