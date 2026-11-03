// card, measured against CDS ContentCard (fixtures/expansion/card.tsx) with the
// same Thai title, description, body text and footer action.
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Hook } from "../Hook"

export default function CardSection() {
  return (
    <Hook name="card-default">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>กองทุนตราสารหนี้ / Bond fund</CardTitle>
          <CardDescription>ความเสี่ยงต่ำ เหมาะกับการพักเงินระยะสั้นและรับผลตอบแทนสม่ำเสมอ / Low risk, steady returns</CardDescription>
        </CardHeader>
        <CardContent>ผลตอบแทน 1 ปี 2.45% / 1Y return</CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm">ดูรายละเอียด</Button>
        </CardFooter>
      </Card>
    </Hook>
  )
}
