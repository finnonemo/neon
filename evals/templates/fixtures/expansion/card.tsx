// card's Counterpart, CDS ContentCard (CDS Card is deprecated in 9.26.1 in its
// favor): 24px radius, 16px padding and 16px between its parts. ContentCard
// draws no surface or border of its own; this one is bordered on bgElevation1,
// the surface Neon's card slot takes (PROVISIONAL, see registry/ui/card.tsx).
// The body's title is headline and its description label2 in fgMuted, with no
// gap between them; CDS clamps them to 2 and 3 lines, so the Thai description
// wraps to 2 or 3 lines here.
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard, ContentCardBody, ContentCardFooter } from "@coinbase/cds-web/cards";
import { Text } from "@coinbase/cds-web/typography";
import { Hook } from "../Hook";

export default function Card() {
  return (
    <Hook name="card-default">
      <ContentCard bordered background="bgElevation1" width={320}>
        <ContentCardBody
          title="กองทุนตราสารหนี้ / Bond fund"
          description="ความเสี่ยงต่ำ เหมาะกับการพักเงินระยะสั้นและรับผลตอบแทนสม่ำเสมอ / Low risk, steady returns"
        />
        <Text as="p" font="body">ผลตอบแทน 1 ปี 2.45% / 1Y return</Text>
        <ContentCardFooter>
          <Button variant="secondary" compact>ดูรายละเอียด</Button>
        </ContentCardFooter>
      </ContentCard>
    </Hook>
  );
}
